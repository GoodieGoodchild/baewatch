# Security Setup — current state & how it fits together

Architecture today: **hosting + AI proxy on Vercel**, **Auth + database on
Firebase**. Firebase is used only for Auth, Firestore and Storage — not for
hosting or functions.

## 1. Firestore & Storage security rules (Firebase)
The database is only as safe as its published rules. Deploy them from the repo:

```bash
npm install -g firebase-tools     # once
firebase login                    # once
firebase deploy --only firestore:rules,storage
```

Or paste `firestore.rules` / `storage.rules` into
Firebase Console → Firestore Database → Rules (and Storage → Rules) → Publish.

Rules enforce: users touch only their own data; a relationship doc is readable
only by its two partners; invite codes can't be enumerated and expire after 48h.

## 2. OpenAI key — lives on Vercel, never in the browser  ✅ DONE
The key is set as a **server-side** Vercel env var (`OPENAI_API_KEY`, no `VITE_`
prefix) and used by the serverless proxy `api/ai.js`. The client calls `/api/ai`
(set via `VITE_AI_PROXY_URL` in `.env.production`) and never sees the key.

To rotate the key: Vercel → project **bae-watch** → Settings → Environment
Variables → update `OPENAI_API_KEY` → redeploy. Set a monthly spend limit at
platform.openai.com. **Never** put the key in a `VITE_` var or `.env.local` —
those get bundled into the browser.

## 3. Deploy
```bash
npm run build
cd dist && vercel deploy --prod --yes
```
(`api/ai.js` and `dist/vercel.json` ship with the deploy; the SPA rewrite
excludes `/api/`.)

## Notes
- The Firebase **web config** (`AIzaSy…`, project id, etc.) is public by design —
  it only identifies the project; the security rules are what protect the data.
- Local dev uses the key from `.env.development.local` (gitignored, localhost
  only), so `npm run build` never bundles it.
- Custom domain later: update the canonical/OG URLs in `index.html`,
  `public/robots.txt`, `public/sitemap.xml`, and add the domain to
  `api/ai.js`'s `ALLOWED_HOSTS`.
- Moving the whole backend to xneelo later: `server/xneelo/baewatch-ai.php` is
  the equivalent AI proxy for a PHP host; the database move is a separate,
  larger step (see chat).
