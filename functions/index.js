// AI proxy — keeps the OpenAI key server-side. The client's aiService.js
// sends the same JSON body it would send to OpenAI; we attach the key here.
//
// Deploy:  firebase deploy --only functions
// Key:     firebase functions:secrets:set OPENAI_API_KEY   (paste a FRESH key)
// Client:  set VITE_AI_PROXY_URL to this function's URL and remove
//          VITE_OPENAI_API_KEY from .env.local

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

const ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o'];

exports.aiProxy = onRequest(
  { secrets: [OPENAI_API_KEY], cors: true, maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST only' });
      return;
    }

    // Only signed-in Bae Watch users may spend AI tokens.
    const idToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch {
      res.status(401).json({ error: 'Sign in to use AI features.' });
      return;
    }

    const body = req.body || {};
    if (!ALLOWED_MODELS.includes(body.model)) body.model = 'gpt-4o-mini';
    // Hard caps so a misbehaving client can't run up the bill.
    body.max_tokens = Math.min(body.max_tokens || 700, 1000);

    try {
      const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } catch (err) {
      res.status(502).json({ error: 'AI upstream failed.' });
    }
  }
);
