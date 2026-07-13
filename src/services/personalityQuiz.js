// personalityQuiz.js — the "Day 2" personality layer (girlfriend's request).
//
// Deliberately NOT front-loaded: love language + attachment are captured on day
// one. On a user's SECOND distinct day of use, Home unlocks this short quiz. The
// result is stored on the profile and folded into Bae's coupleContext, so cards,
// games and forecasts get sharper over time without a heavy signup.
//
// This is a warm, couple-relevant "how you operate" model — not clinical MBTI.
// Four spectrums, each a slider between two friendly poles:
//   energy:   Recharger (inward) ←→ Radiator (outward)
//   decide:   Head (logic) ←→ Heart (feeling)
//   plan:     Anchor (structure) ←→ Breeze (spontaneous)
//   conflict: Processor (needs time) ←→ Hasher (talk it out now)

export const personalitySpectrums = [
  { key: 'energy', low: 'Recharger', high: 'Radiator', lowEmoji: '🔋', highEmoji: '☀️',
    lowDesc: 'You refuel in calm and quiet', highDesc: 'You come alive around people and buzz' },
  { key: 'decide', low: 'Head', high: 'Heart', lowEmoji: '🧠', highEmoji: '💗',
    lowDesc: 'You reason it out first', highDesc: 'You feel your way to the answer' },
  { key: 'plan', low: 'Anchor', high: 'Breeze', lowEmoji: '⚓', highEmoji: '🍃',
    lowDesc: 'You love a plan and a rhythm', highDesc: 'You love room to improvise' },
  { key: 'conflict', low: 'Processor', high: 'Hasher', lowEmoji: '🌊', highEmoji: '🔥',
    lowDesc: 'You need time before you talk', highDesc: 'You want to talk it through now' },
];

// Each question nudges one spectrum toward high (+1) or low (-1).
export const personalityQuestions = [
  { id: 'q1', spectrum: 'energy', text: 'After a long, social day you most want to…',
    low: 'Curl up alone and decompress', high: 'Keep the good energy going with people' },
  { id: 'q2', spectrum: 'energy', text: 'A perfect Saturday leans…',
    low: 'Quiet, cosy, low-key', high: 'Out, busy, full of faces' },
  { id: 'q3', spectrum: 'decide', text: 'Making a big call, you trust…',
    low: 'The pros-and-cons list', high: 'Your gut and how it feels' },
  { id: 'q4', spectrum: 'decide', text: "When I'm upset, what helps first is…",
    low: 'Understanding *why* it happened', high: 'Feeling that you *get* how I feel' },
  { id: 'q5', spectrum: 'plan', text: 'A trip is better when it’s…',
    low: 'Planned out with a loose itinerary', high: 'Figured out as we go' },
  { id: 'q6', spectrum: 'plan', text: 'Surprises make me…',
    low: 'A little anxious — warn me', high: 'Light up — I love them' },
  { id: 'q7', spectrum: 'conflict', text: 'Mid-disagreement, I do best when I can…',
    low: 'Step away and come back calmer', high: 'Stay and hash it out until we’re okay' },
  { id: 'q8', spectrum: 'conflict', text: 'Silence after a fight feels…',
    low: 'Necessary — I’m regulating', high: 'Unbearable — let’s just talk' },
];

// answers: { [questionId]: 'low' | 'high' }
export function scorePersonality(answers) {
  const totals = {};
  const counts = {};
  personalityQuestions.forEach((q) => {
    const a = answers[q.id];
    if (!a) return;
    totals[q.spectrum] = (totals[q.spectrum] || 0) + (a === 'high' ? 1 : -1);
    counts[q.spectrum] = (counts[q.spectrum] || 0) + 1;
  });
  // Normalize each spectrum to 0..100 (50 = balanced) and pick the pole label.
  const profile = {};
  personalitySpectrums.forEach((s) => {
    const t = totals[s.key] || 0;
    const c = counts[s.key] || 1;
    const pct = Math.round(((t / c) + 1) * 50); // -1..1 -> 0..100
    profile[s.key] = { score: pct, pole: pct >= 50 ? s.high : s.low };
  });
  return profile;
}

// A short shareable one-liner for the couple, e.g.
// "Radiator · Heart · Breeze · Processor"
export function personalityHeadline(profile) {
  return personalitySpectrums.map((s) => profile[s.key]?.pole).filter(Boolean).join(' · ');
}
