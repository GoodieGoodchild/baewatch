# Security Setup — actions YOU must take

The repo now contains security rules and an AI proxy, but **none of it protects
anything until deployed**. Do these in order (≈20 minutes total).

## 1. Deploy the database & storage rules (do this FIRST — the DB is open until you do)

```bash
npm install -g firebase-tools     # once
firebase login                    # once
firebase deploy --only firestore:rules,storage
```

Or paste the contents of `firestore.rules` / `storage.rules` into
Firebase Console → Firestore Database → Rules (and Storage → Rules) → Publish.

## 2. Rotate the OpenAI key

The current key has been used in local dev and should be treated as exposed.
Create a fresh key at https://platform.openai.com/api-keys and **revoke the old
one**. Set a monthly spending limit while you're there.

## 3. Deploy the AI proxy (before any public hosting)

Requires the Blaze (pay-as-you-go) plan for Cloud Functions:

```bash
cd functions && npm install && cd ..
firebase functions:secrets:set OPENAI_API_KEY   # paste the FRESH key
firebase deploy --only functions
```

Then in `.env.local`:
```
VITE_AI_PROXY_URL=https://aiproxy-<hash>-uc.a.run.app   # URL printed by deploy
VITE_OPENAI_API_KEY=                                     # empty — key is server-side now
```

The proxy only accepts requests from signed-in Firebase users, whitelists
models, and caps max_tokens — so nobody can spend on your key.

## 4. Deploy hosting (when ready to go live)

```bash
npm run build
firebase deploy --only hosting
```

## Notes

- Until step 3, keeping `VITE_OPENAI_API_KEY` in `.env.local` is fine for
  local/LAN testing — just don't publish a build made that way.
- Invite codes now expire after 48h and can't be enumerated (the code is the
  doc ID; listing is denied by rules).
- If you later buy a custom domain, update the canonical/og URLs in
  `index.html`, `public/robots.txt`, and `public/sitemap.xml`.
