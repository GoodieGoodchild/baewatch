// aiService.js — thin OpenAI wrapper for Bae Watch's emotional-intelligence features.
//
// SECURITY NOTE: Vite exposes any VITE_* env var in the client bundle. A raw
// OpenAI key placed in VITE_OPENAI_API_KEY is therefore visible to anyone who
// loads the app. That is acceptable for local development and private testing
// only. For production, set VITE_AI_PROXY_URL to a serverless endpoint (e.g. a
// Firebase Cloud Function) that holds the key server-side and forwards the
// request. When VITE_AI_PROXY_URL is set, the key is never read on the client.

const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || '';
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export const isAIConfigured = () => Boolean(PROXY_URL || OPENAI_KEY);

/**
 * Low-level chat call. Returns the assistant message string.
 * Routes through the proxy when configured, otherwise calls OpenAI directly.
 */
async function chat(messages, { temperature = 0.7, maxTokens = 700, responseFormat } = {}) {
  if (!isAIConfigured()) {
    throw new Error(
      'AI is not configured. Set VITE_OPENAI_API_KEY (dev) or VITE_AI_PROXY_URL (production).'
    );
  }

  const body = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (responseFormat) body.response_format = responseFormat;

  const url = PROXY_URL || OPENAI_URL;
  const headers = { 'Content-Type': 'application/json' };
  if (PROXY_URL) {
    // The proxy authenticates Bae Watch users, not OpenAI keys: send the
    // Firebase ID token so only signed-in users can spend AI tokens.
    const { auth } = await import('../firebase');
    const idToken = await auth.currentUser?.getIdToken?.();
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
  } else {
    headers.Authorization = `Bearer ${OPENAI_KEY}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

/**
 * Chat call that expects a JSON object back. Uses OpenAI's json_object mode and
 * parses the result. Throws if parsing fails.
 */
export async function chatJSON(messages, opts = {}) {
  const raw = await chat(messages, {
    ...opts,
    responseFormat: { type: 'json_object' },
  });
  try {
    return JSON.parse(raw);
  } catch {
    // Best-effort recovery: pull the first {...} block out of the response.
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI returned malformed JSON.');
  }
}

export { chat };
