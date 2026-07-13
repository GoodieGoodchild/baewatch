<?php
/**
 * Bae Watch AI proxy — for xneelo (or any PHP host).
 *
 * WHY: the OpenAI key must NOT ship in the browser bundle (that's how the last
 * key got scraped off Vercel and disabled). This script keeps the key on your
 * server. The app calls THIS url; this script adds the key and forwards to
 * OpenAI, so the key is never sent to browsers.
 *
 * SETUP ON XNEELO:
 *   1. Put this file somewhere web-accessible, e.g. public_html/api/baewatch-ai.php
 *      -> it becomes https://yourdomain.co.za/api/baewatch-ai.php
 *   2. Create a file ONE LEVEL ABOVE public_html (so it's NOT web-reachable):
 *        /home/youruser/baewatch-secrets.php   containing:
 *          <?php return ['OPENAI_KEY' => 'sk-proj-YOUR-NEW-KEY'];
 *      Adjust $secretsPath below if your path differs.
 *   3. In the app's .env (Vercel env or .env.local), set:
 *        VITE_AI_PROXY_URL=https://yourdomain.co.za/api/baewatch-ai.php
 *        VITE_OPENAI_API_KEY=            (leave EMPTY — key lives here now)
 *   4. Set ALLOWED_ORIGIN below to your app's URL.
 *
 * This also enforces a hard per-day token ceiling as a backstop against abuse.
 */

// ---- Config -----------------------------------------------------------------
$ALLOWED_ORIGIN = 'https://bae-watch.vercel.app'; // your app origin
$ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o'];
$MAX_TOKENS_CAP = 1000;                 // clamp any single request
$DAILY_CALL_CAP = 800;                  // total calls/day across all users (backstop)
$secretsPath    = __DIR__ . '/../../baewatch-secrets.php';
// -----------------------------------------------------------------------------

header('Access-Control-Allow-Origin: ' . $ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); echo json_encode(['error' => 'POST only']); exit;
}

// Load the key from OUTSIDE the web root.
if (!file_exists($secretsPath)) {
  http_response_code(500); echo json_encode(['error' => 'Server key not configured']); exit;
}
$secrets = require $secretsPath;
$OPENAI_KEY = $secrets['OPENAI_KEY'] ?? '';
if (!$OPENAI_KEY) {
  http_response_code(500); echo json_encode(['error' => 'Server key missing']); exit;
}

// ---- Daily call ceiling (simple file counter) -------------------------------
$counterFile = sys_get_temp_dir() . '/baewatch_ai_' . date('Y-m-d') . '.count';
$count = file_exists($counterFile) ? (int) file_get_contents($counterFile) : 0;
if ($count >= $DAILY_CALL_CAP) {
  http_response_code(429);
  echo json_encode(['error' => 'Daily AI limit reached. Try again tomorrow.']);
  exit;
}

// ---- Validate + clamp the request body --------------------------------------
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body) || empty($body['messages'])) {
  http_response_code(400); echo json_encode(['error' => 'Bad request']); exit;
}
if (!in_array($body['model'] ?? '', $ALLOWED_MODELS, true)) $body['model'] = 'gpt-4o-mini';
if (!isset($body['max_tokens']) || $body['max_tokens'] > $MAX_TOKENS_CAP) {
  $body['max_tokens'] = $MAX_TOKENS_CAP;
}

// ---- Forward to OpenAI ------------------------------------------------------
$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode($body),
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $OPENAI_KEY,
  ],
  CURLOPT_TIMEOUT => 30,
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($response === false) {
  http_response_code(502); echo json_encode(['error' => 'AI upstream failed']); exit;
}
curl_close($ch);

// Count only successful calls.
if ($status >= 200 && $status < 300) {
  file_put_contents($counterFile, $count + 1, LOCK_EX);
}

http_response_code($status);
echo $response;
