// funService.js — Bae, the playful side of the AI. Personalized game content
// and the relationship weather forecast. Every caller must degrade gracefully
// when AI is unconfigured (use isAIConfigured from aiService).

import { chatJSON } from './aiService';

const SYSTEM = `You are "Bae" — the warm, playful AI companion inside the couples app Bae Watch.
You know attachment theory and love languages, but you wear it lightly: your job here is FUN
that sneaks in connection. Flirty-sweet, never crude. Specific to this couple, never generic.
Keep everything short — it renders on a phone. Never diagnose, never pressure; every suggestion
is an invitation.`;

function coupleContext({ profile = {}, selfInsight, partnerInsight }) {
  const bits = [
    profile.yourName ? `Partner A: ${profile.yourName}` : null,
    profile.partnerName ? `Partner B: ${profile.partnerName}` : null,
    profile.yourLoveLanguage ? `A's love language: ${profile.yourLoveLanguage}` : null,
    profile.partnerLoveLanguage ? `B's love language: ${profile.partnerLoveLanguage}` : null,
    selfInsight?.dominant ? `A's attachment style: ${selfInsight.dominant}` : null,
    partnerInsight?.dominant ? `B's attachment style: ${partnerInsight.dominant}` : null,
  ];
  return bits.filter(Boolean).join('\n');
}

/**
 * A fresh, personalized love question for the Love Questions game.
 * `asked` = questions already used this round, so Bae doesn't repeat.
 */
export async function generateLoveQuestion(couple, asked = []) {
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `This couple:\n${coupleContext(couple)}\n
Questions already asked this round:\n${asked.map((q) => `- ${q}`).join('\n') || '(none)'}\n
Invent ONE new question for them to ask each other — playful or tender, tailored to who they
are (styles, love languages). Not a repeat, not generic.
Return JSON: { "question": "...", "spark": "one flirty/warm line about why this question is fun for THESE two (max 15 words)" }`,
    },
  ];
  return chatJSON(messages, { temperature: 0.95, maxTokens: 200 });
}

/**
 * Polishes a gratitude note into the partner's love language, keeping the
 * writer's voice. Returns { polished, why }.
 */
export async function polishGratitudeNote({ note, partnerName, partnerLoveLanguage }) {
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `${partnerName || 'Their partner'}'s love language: ${partnerLoveLanguage || 'unknown'}.
Rough gratitude note written for them:\n"${note}"\n
Rewrite it so it lands in THEIR love language — keep it short (2-3 sentences), keep the
writer's authentic voice, make it warmer and more specific. No cheese overload.
Return JSON: { "polished": "...", "why": "one line on what you tuned for their language (max 12 words)" }`,
    },
  ];
  return chatJSON(messages, { temperature: 0.8, maxTokens: 250 });
}

/**
 * Bae's relationship weather forecast — reads the recent check-in history and
 * returns a playful weather-report-style summary with one gentle suggestion.
 */
export async function generateWeatherForecast({ couple, weatherMood, connectionLevel, recentCheckIns = [] }) {
  const history = recentCheckIns
    .slice(-7)
    .map((c) => `${c.date}: ${c.moodLabel || c.stateId}${c.note ? ` — "${c.note}"` : ''}`)
    .join('\n');
  const messages = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `This couple:\n${coupleContext(couple)}\n
Current weather mood: ${weatherMood}. Connection level: ${connectionLevel}/100.
Recent check-ins:\n${history || '(none yet)'}\n
Write their relationship weather forecast like a charming TV weather reporter.
Return JSON: {
  "headline": "forecast headline in weather-speak (max 10 words, include a weather emoji)",
  "forecast": "2-3 sentences reading the emotional weather pattern, warm and a little playful",
  "tomorrowTip": "one small optional action to invite sunshine tomorrow (max 20 words)"
}`,
    },
  ];
  return chatJSON(messages, { temperature: 0.85, maxTokens: 350 });
}
