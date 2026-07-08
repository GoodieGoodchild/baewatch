// attachmentProfiles.js — the psychology layer behind Bae Watch's
// "Understanding Me" feature. Deterministic quiz + attachment/trauma reference
// data. The AI layer (aiService) turns these results into partner-facing,
// compassionate translations.

// A short, non-clinical self-reflection quiz. Each option nudges a score toward
// one of the four attachment styles. This is a conversation starter, NOT a
// diagnosis — copy throughout the app should say so.
export const attachmentQuiz = [
  {
    id: 'conflict',
    question: 'When tension rises with your partner, your first instinct is to…',
    options: [
      { label: 'Go quiet and pull inward until I feel steady', style: 'avoidant', emoji: '🤫' },
      { label: 'Reach out right away — I need to fix it now', style: 'anxious', emoji: '📞' },
      { label: 'Stay present and talk it through calmly', style: 'secure', emoji: '🫂' },
      { label: 'Feel torn — I want closeness but also want to flee', style: 'disorganized', emoji: '🌀' },
    ],
  },
  {
    id: 'needs',
    question: 'Asking for what I need emotionally feels…',
    options: [
      { label: 'Uncomfortable — I would rather handle it myself', style: 'avoidant', emoji: '🚪' },
      { label: 'Urgent — and I worry I am asking too much', style: 'anxious', emoji: '💭' },
      { label: 'Natural — I trust it will be received', style: 'secure', emoji: '🌱' },
      { label: 'Confusing — I am not always sure what I need', style: 'disorganized', emoji: '❓' },
    ],
  },
  {
    id: 'space',
    question: 'When my partner needs space, I tend to feel…',
    options: [
      { label: 'Relieved — I like space too', style: 'avoidant', emoji: '😌' },
      { label: 'Anxious — did I do something wrong?', style: 'anxious', emoji: '😟' },
      { label: 'Fine — space is healthy for both of us', style: 'secure', emoji: '☀️' },
      { label: 'Both relieved and abandoned at once', style: 'disorganized', emoji: '🎭' },
    ],
  },
  {
    id: 'closeness',
    question: 'Deep closeness and vulnerability make me…',
    options: [
      { label: 'A little claustrophobic — I need to come up for air', style: 'avoidant', emoji: '🌊' },
      { label: 'Crave even more reassurance', style: 'anxious', emoji: '🤗' },
      { label: 'Feel safe and connected', style: 'secure', emoji: '💛' },
      { label: 'Long for it but brace for it to hurt', style: 'disorganized', emoji: '⚡' },
    ],
  },
  {
    id: 'stress',
    question: 'Under stress, my partner is most likely to see me…',
    options: [
      { label: 'Withdraw, shut down, or get very logical', style: 'avoidant', emoji: '🧊' },
      { label: 'Seek constant contact and reassurance', style: 'anxious', emoji: '🔥' },
      { label: 'Name what I feel and ask for support', style: 'secure', emoji: '🗣️' },
      { label: 'Swing between clinging and pushing away', style: 'disorganized', emoji: '🔀' },
    ],
  },
];

export const attachmentStyles = {
  secure: {
    key: 'secure',
    label: 'Secure',
    emoji: '🌳',
    color: 'from-green-200 to-emerald-100',
    summary:
      'You generally trust that closeness is safe and that needs can be spoken. Under stress you can stay present and repair.',
    growthEdge:
      'Your steadiness is a gift. Your edge is patience with partners whose nervous systems are still learning safety.',
  },
  anxious: {
    key: 'anxious',
    label: 'Anxious / Preoccupied',
    emoji: '🌊',
    color: 'from-blue-200 to-sky-100',
    summary:
      'You feel love deeply and fear losing it. Distance can read as danger, and you seek reassurance to feel safe again.',
    growthEdge:
      'Your warmth and attunement are strengths. Your edge is self-soothing before seeking, so reassurance lands instead of overwhelming.',
  },
  avoidant: {
    key: 'avoidant',
    label: 'Avoidant / Dismissing',
    emoji: '🏔️',
    color: 'from-slate-200 to-gray-100',
    summary:
      'You value independence and self-reliance. When overwhelmed you withdraw to regulate — not to reject, but to survive the intensity.',
    growthEdge:
      'Your calm and autonomy are strengths. Your edge is naming the withdrawal out loud so silence stops reading as abandonment.',
  },
  disorganized: {
    key: 'disorganized',
    label: 'Disorganized / Fearful-Avoidant',
    emoji: '🌗',
    color: 'from-purple-200 to-violet-100',
    summary:
      'You long for closeness and fear it at the same time, often because closeness once came with pain. You may approach then retreat.',
    growthEdge:
      'Your depth and empathy are strengths. Your edge is slowing down enough to notice which feeling is driving — the longing or the fear.',
  },
};

export const traumaResponsePatterns = [
  { id: 'withdraw', label: 'I go silent or withdraw', emoji: '🤐' },
  { id: 'overexplain', label: 'I over-explain or over-apologize', emoji: '🗯️' },
  { id: 'shutdown', label: 'I emotionally shut down / go numb', emoji: '🧊' },
  { id: 'people-please', label: 'I abandon my own needs to keep the peace', emoji: '🙇' },
  { id: 'criticize', label: 'I get critical or defensive', emoji: '🛡️' },
  { id: 'cling', label: 'I seek constant reassurance', emoji: '🫶' },
  { id: 'control', label: 'I try to control the situation', emoji: '🎛️' },
  { id: 'flee', label: 'I want to physically leave / escape', emoji: '🚪' },
];

// Optional context each partner can flag so the AI is more attuned.
export const neurodivergenceContext = [
  { id: 'autistic', label: 'Autistic', emoji: '🧩' },
  { id: 'adhd', label: 'ADHD', emoji: '⚡' },
  { id: 'anxiety', label: 'Anxiety', emoji: '💭' },
  { id: 'depression', label: 'Depression', emoji: '🌧️' },
  { id: 'ptsd', label: 'Trauma / PTSD', emoji: '💔' },
  { id: 'none', label: 'Prefer not to say', emoji: '🤍' },
];

/**
 * Deterministic scoring — tallies option styles and returns the dominant one
 * plus the full distribution (so the UI can show nuance / ties).
 */
export function scoreAttachmentQuiz(answers) {
  const tally = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
  Object.values(answers).forEach((style) => {
    if (tally[style] !== undefined) tally[style] += 1;
  });
  const dominant = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  return { dominant, tally };
}
