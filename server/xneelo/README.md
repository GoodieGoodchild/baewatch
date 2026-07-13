# Hiding the OpenAI key on xneelo (do this to stop the key being scraped)

The last key was disabled because it shipped inside the browser bundle on Vercel
and got scraped. The fix: keep the key on your xneelo server and have the app
call your server instead of OpenAI directly.

## Steps

### 1. Regenerate the OpenAI key (yours to do)
- https://platform.openai.com/api-keys → create a new secret key.
- **Set a monthly spend limit** while you're there (Settings → Limits).
- Do NOT put this new key in `.env.local` / Vercel anymore — it goes on the server only.

### 2. Upload the proxy to xneelo
- Upload `baewatch-ai.php` to `public_html/api/baewatch-ai.php`
  → it becomes `https://YOURDOMAIN.co.za/api/baewatch-ai.php`
- Create `baewatch-secrets.php` **one level above** `public_html` (so the web can't read it):
  ```php
  <?php return ['OPENAI_KEY' => 'sk-proj-YOUR-NEW-KEY'];
  ```
  Typical path: `/home/youruser/baewatch-secrets.php`. If your layout differs,
  edit `$secretsPath` at the top of `baewatch-ai.php`.
- In `baewatch-ai.php`, set `$ALLOWED_ORIGIN` to your app URL (`https://bae-watch.vercel.app`).

### 3. Point the app at the proxy
In Vercel project env (Settings → Environment Variables) — or `.env.local` for local:
```
VITE_AI_PROXY_URL=https://YOURDOMAIN.co.za/api/baewatch-ai.php
VITE_OPENAI_API_KEY=        ← leave EMPTY. The key lives on the server now.
```
Rebuild/redeploy. The app already routes through `VITE_AI_PROXY_URL` when set
(see `src/services/aiService.js`) — no code change needed.

### 4. Verify
Open the app → Understanding Me → Create my card. If the card generates, the
proxy works and the key is never exposed to browsers.

## What protects you now
- **Key never in the browser** — lives only in `baewatch-secrets.php` on your server.
- **Server backstop** — the proxy caps `max_tokens` and enforces a daily call
  ceiling (`$DAILY_CALL_CAP`, default 800/day) so a leak can't run up a huge bill.
- **Per-user app limit** — inside the app each person gets only 2 AI card
  generations ("get it right in 2"), plus small caps on other AI features.

Until you set this up, testing with friends using a bundled key is fine (as you
said) — just keep a spend limit on the key and rotate it if it leaks again.
