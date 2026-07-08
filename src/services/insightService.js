// insightService.js — turns a person's self-reflection (attachment style,
// trauma responses, neurodivergence context) into warm, partner-facing
// guidance using the AI layer. Everything here is framed as translation and
// coaching, never diagnosis.

import { chatJSON } from './aiService';
import { attachmentStyles } from './attachmentProfiles';

const SYSTEM = `You are a warm, trauma-informed relationship coach inside a couples app called Bae Watch.
You blend attachment theory, Gottman method, and nervous-system (polyvagal) awareness.
You are NOT a therapist and never diagnose. You translate one partner's inner experience into
compassionate language their partner can actually understand and act on.
Rules:
- Be specific, tender, and non-clinical. Talk like a wise, kind friend, not a textbook.
- Never blame either partner. Frame protective behaviours as survival strategies, not flaws.
- Always give the partner something concrete they can DO.
- Keep every field tight — this renders on a phone.
- Respect neurodivergence: an autistic partner's need for clear words is a need, not a demand.`;

function describeSelf({ dominant, traumaResponses = [], neurodivergence = [], yourName, freeText }) {
  const style = attachmentStyles[dominant];
  return [
    yourName ? `Name: ${yourName}` : null,
    style ? `Attachment style: ${style.label} — ${style.summary}` : null,
    traumaResponses.length ? `Stress/trauma responses: ${traumaResponses.join(', ')}` : null,
    neurodivergence.length ? `Neurodivergence / mental-health context: ${neurodivergence.join(', ')}` : null,
    freeText ? `In their own words: "${freeText}"` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generates a "Partner Translation Card" — how this person's protective
 * behaviours FEEL from the inside, how they may LAND on their partner, and what
 * the partner can do. Returns a structured object.
 */
export async function generateTranslationCard(self) {
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Here is one partner's self-reflection:\n\n${describeSelf(self)}\n\n
Return JSON with exactly these keys:
{
  "headline": "a short, warm one-line summary of who they are in love (max 12 words)",
  "whatIDo": "1-2 sentences naming their most common protective behaviour plainly",
  "whatItMeans": "1-2 sentences on what is REALLY happening inside when they do it",
  "howItLands": "1-2 sentences, gentle, on how it may unintentionally affect their partner",
  "whatHelps": ["3 concrete things the partner can do or say — each a short phrase"],
  "myCommitment": "one sentence THIS person can commit to, in first person ('I will...')"
}`,
    },
  ];
  return chatJSON(messages, { temperature: 0.75, maxTokens: 600 });
}

/**
 * Given BOTH partners' self-reflections, generate a "Connection Bridge" —
 * where their styles clash and how to meet in the middle. Degrades: caller
 * should only invoke when partner data exists.
 */
export async function generateConnectionBridge(you, partner) {
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Two partners in a relationship.

PARTNER A:
${describeSelf(you)}

PARTNER B:
${describeSelf(partner)}

Return JSON with exactly these keys:
{
  "dynamic": "1-2 sentences naming the core dance between these two styles (e.g. pursue-withdraw)",
  "flashpoint": "the specific moment things most often go sideways for this pair",
  "forA": "one concrete thing Partner A can do differently, in second person ('When you...')",
  "forB": "one concrete thing Partner B can do differently, in second person",
  "sharedRitual": "one small shared practice that would build safety for both",
  "reframe": "a hopeful one-line reframe of their differences as complementary"
}`,
    },
  ];
  return chatJSON(messages, { temperature: 0.7, maxTokens: 600 });
}

/**
 * Real-time "translate this moment" helper — a partner types what just
 * happened, and the AI reframes it through the other person's attachment lens.
 */
export async function reframeMoment({ self, situation }) {
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `This person's profile:\n${describeSelf(self)}\n
They wrote about a moment that just happened:\n"${situation}"\n
Return JSON:
{
  "whatYouFelt": "reflect their feeling back in one warm sentence",
  "whatPartnerMayHaveFelt": "gently name what their partner might have experienced",
  "bridgeSentence": "an exact sentence they could say to their partner to reconnect",
  "microStep": "one tiny action to take in the next 5 minutes"
}`,
    },
  ];
  return chatJSON(messages, { temperature: 0.7, maxTokens: 500 });
}
