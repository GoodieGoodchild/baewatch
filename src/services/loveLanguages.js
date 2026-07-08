// loveLanguages.js — the five love languages, plus how to actually speak each
// one and gentle reminders. Used by onboarding (set your own), the Love
// Languages page (learn + note your partner's), and home reminders.

export const loveLanguages = {
  words: {
    key: 'words',
    label: 'Words of Affirmation',
    emoji: '💬',
    color: 'from-blue-200 to-sky-100',
    short: 'Feeling loved through spoken and written appreciation.',
    receiving: 'You feel most loved when your partner tells you — genuine compliments, encouragement, "I appreciate you."',
    speakIt: [
      'Send an unprompted text naming one thing you love about them',
      'Say "thank you" for something small they usually do unnoticed',
      'Leave a short note where they\'ll find it',
      'Tell them specifically what they did well, not just "good job"',
    ],
    avoid: 'Silence or criticism lands especially hard. Withholding words reads as withholding love.',
  },
  quality: {
    key: 'quality',
    label: 'Quality Time',
    emoji: '⏳',
    color: 'from-amber-200 to-yellow-100',
    short: 'Feeling loved through undivided, present attention.',
    receiving: 'You feel most loved when your partner is truly present — phone down, eyes up, fully with you.',
    speakIt: [
      'Put your phone in another room for 20 focused minutes',
      'Suggest a walk with no agenda but each other',
      'Ask a real question and listen to the whole answer',
      'Protect a small daily ritual — coffee, dinner, wind-down — just for you two',
    ],
    avoid: 'Distraction and divided attention sting. Being on your phone together can feel like being alone.',
  },
  acts: {
    key: 'acts',
    label: 'Acts of Service',
    emoji: '🛠️',
    color: 'from-green-200 to-emerald-100',
    short: 'Feeling loved when someone eases your load.',
    receiving: 'You feel most loved when your partner does things that make your life easier — "let me handle that."',
    speakIt: [
      'Do a chore they dread before they ask',
      'Handle one thing on their plate today without being asked',
      'Ask "what would take something off your plate right now?"',
      'Follow through on the small thing you said you\'d do',
    ],
    avoid: 'Broken promises and "I\'ll do it later" that never comes feel like being deprioritised.',
  },
  touch: {
    key: 'touch',
    label: 'Physical Touch',
    emoji: '🤗',
    color: 'from-rose-200 to-pink-100',
    short: 'Feeling loved through warmth and physical closeness.',
    receiving: 'You feel most loved through touch — a hug, a hand on the back, sitting close, a long embrace.',
    speakIt: [
      'Give a 20-second hug (long enough to actually relax)',
      'Reach for their hand while walking or watching TV',
      'A hand on the shoulder as you pass by',
      'Sit close instead of across the room',
    ],
    avoid: 'Physical distance or pulling away during conflict can feel like rejection of them, not the issue.',
  },
  gifts: {
    key: 'gifts',
    label: 'Gifts',
    emoji: '🎁',
    color: 'from-purple-200 to-violet-100',
    short: 'Feeling loved through thoughtful tokens that say "I thought of you."',
    receiving: 'You feel most loved by thoughtful gestures — it\'s never about cost, it\'s about being thought of.',
    speakIt: [
      'Pick up their favourite snack on your way home',
      'Save a meme or article that made you think of them',
      'Bring back a small something from a trip, however tiny',
      'Mark the small dates that matter to them',
    ],
    avoid: 'Forgetting occasions or thoughtless last-minute gestures can feel like an afterthought.',
  },
};

export const loveLanguageList = Object.values(loveLanguages);

// A short quiz-free picker prompt used in onboarding.
export const RECEIVE_PROMPT = 'When do you feel MOST loved?';

/**
 * Builds a reminder string for the partner's language, e.g.
 * "Maya feels most loved through Words of Affirmation 💬 — try a genuine
 * compliment today, not a gift."
 */
export function partnerReminder(partnerName, languageKey) {
  const lang = loveLanguages[languageKey];
  if (!lang) return null;
  const name = partnerName || 'Your partner';
  const tip = lang.speakIt[0];
  return {
    emoji: lang.emoji,
    label: lang.label,
    headline: `${name} feels most loved through ${lang.label}`,
    tip,
    avoid: lang.avoid,
  };
}
