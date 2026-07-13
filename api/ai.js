// Vercel Serverless Function — the AI proxy that keeps the OpenAI key OFF the
// browser. The key lives in Vercel's server-side env (OPENAI_API_KEY), never in
// the client bundle, so it can't be scraped off the deployed site.
//
// SET THE KEY (once, in the Vercel dashboard — you paste it, nobody commits it):
//   Vercel → project "bae-watch" → Settings → Environment Variables →
//   Add:  Name = OPENAI_API_KEY   Value = <your new key>   Environments = Production
//   (Do NOT prefix it with VITE_ — that would bundle it. Plain OPENAI_API_KEY.)
//
// The app already calls this endpoint in production (VITE_AI_PROXY_URL=/api/ai).

const ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o'];
const MAX_TOKENS_CAP = 1000;
// Only allow calls that come from the app itself (raises the bar for randoms
// who find the endpoint). Add your custom xneelo domain here later.
const ALLOWED_HOSTS = ['bae-watch.vercel.app', 'localhost:5184', 'localhost:5173'];

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  // Light origin check — block obvious off-site abuse.
  const origin = req.headers.origin || req.headers.referer || '';
  const ok = ALLOWED_HOSTS.some((h) => origin.includes(h));
  if (origin && !ok) { res.status(403).json({ error: 'Forbidden origin' }); return; }

  const key = process.env.OPENAI_API_KEY;
  if (!key) { res.status(500).json({ error: 'AI not configured on the server' }); return; }

  // Body is already parsed by Vercel for application/json.
  const body = typeof req.body === 'object' && req.body ? req.body : {};
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'Bad request' }); return;
  }
  if (!ALLOWED_MODELS.includes(body.model)) body.model = 'gpt-4o-mini';
  if (!body.max_tokens || body.max_tokens > MAX_TOKENS_CAP) body.max_tokens = MAX_TOKENS_CAP;

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'AI upstream failed' });
  }
};
