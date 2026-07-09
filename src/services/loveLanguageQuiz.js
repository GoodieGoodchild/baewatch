// loveLanguageQuiz.js — scenario-based love language assessment.
// People routinely misdiagnose their own language when asked directly, so we
// use forced-choice scenarios for how you RECEIVE love, plus a short block on
// how you naturally GIVE it. The receive/give gap is surfaced to the couple —
// it's where "I'm trying so hard" meets "I don't feel loved" in most fights.

export const receiveScenarios = [
  {
    id: 'r1',
    scenario: 'You had a genuinely awful week. Which lands deepest?',
    options: [
      { label: '"I\'m so proud of how you handled that."', lang: 'words', emoji: '💬' },
      { label: 'A long hug, no words needed', lang: 'touch', emoji: '🤗' },
      { label: 'They cancel plans to just be with you', lang: 'quality', emoji: '⏳' },
      { label: 'You come home and the chores are done', lang: 'acts', emoji: '🛠️' },
    ],
  },
  {
    id: 'r2',
    scenario: 'Your partner is away for a week. What do you miss most?',
    options: [
      { label: 'Falling asleep next to them', lang: 'touch', emoji: '🌙' },
      { label: 'The little check-in texts', lang: 'words', emoji: '📱' },
      { label: 'Doing everyday things together', lang: 'quality', emoji: '🍳' },
      { label: 'How they handle the things you hate doing', lang: 'acts', emoji: '📦' },
    ],
  },
  {
    id: 'r3',
    scenario: 'Which moment would you replay for weeks?',
    options: [
      { label: 'They surprised you with the exact thing you mentioned once', lang: 'gifts', emoji: '🎁' },
      { label: 'They told you specifically why they love you', lang: 'words', emoji: '💌' },
      { label: 'A whole day, phones off, just you two', lang: 'quality', emoji: '🌅' },
      { label: 'They held your hand the entire movie', lang: 'touch', emoji: '🎬' },
    ],
  },
  {
    id: 'r4',
    scenario: "You're stressed about tomorrow. What actually calms you?",
    options: [
      { label: '"You\'ve got this — and here\'s why."', lang: 'words', emoji: '🗣️' },
      { label: 'They quietly make you tea and handle dinner', lang: 'acts', emoji: '☕' },
      { label: 'A back rub while you vent', lang: 'touch', emoji: '💆' },
      { label: 'They sit with you and just listen', lang: 'quality', emoji: '👂' },
    ],
  },
  {
    id: 'r5',
    scenario: 'What would quietly hurt the most?',
    options: [
      { label: 'They forgot something small you told them mattered', lang: 'gifts', emoji: '🥀' },
      { label: 'A week without real conversation', lang: 'quality', emoji: '📵' },
      { label: 'They stopped saying "I love you" first', lang: 'words', emoji: '🤐' },
      { label: 'They stopped reaching for you', lang: 'touch', emoji: '🧊' },
    ],
  },
  {
    id: 'r6',
    scenario: 'Your birthday. Which version feels most loved?',
    options: [
      { label: 'A handwritten letter about your year together', lang: 'words', emoji: '✍️' },
      { label: 'They planned the whole day so you decide nothing', lang: 'acts', emoji: '🗓️' },
      { label: 'A gift that proves they really know you', lang: 'gifts', emoji: '🎀' },
      { label: 'An unhurried day of just being together', lang: 'quality', emoji: '🧺' },
    ],
  },
  {
    id: 'r7',
    scenario: 'After a small argument is resolved, what restores you fastest?',
    options: [
      { label: 'Being held', lang: 'touch', emoji: '🫂' },
      { label: 'Hearing "we\'re okay, I\'m not going anywhere"', lang: 'words', emoji: '💛' },
      { label: 'Doing something light together right after', lang: 'quality', emoji: '🎲' },
      { label: 'They bring you your favourite snack as a peace offering', lang: 'gifts', emoji: '🍫' },
    ],
  },
  {
    id: 'r8',
    scenario: 'Which tiny daily thing would you protect at all costs?',
    options: [
      { label: 'The goodbye kiss', lang: 'touch', emoji: '💋' },
      { label: 'Morning coffee made how you like it', lang: 'acts', emoji: '☕' },
      { label: 'The "how was your day, really?" talk', lang: 'quality', emoji: '🛋️' },
      { label: 'The random "thinking of you" message', lang: 'words', emoji: '💭' },
    ],
  },
];

export const giveScenarios = [
  {
    id: 'g1',
    scenario: 'Your partner had a rough day. What do you do first, instinctively?',
    options: [
      { label: 'Tell them how amazing they are', lang: 'words', emoji: '💬' },
      { label: 'Pull them in for a hug', lang: 'touch', emoji: '🤗' },
      { label: 'Take something off their plate', lang: 'acts', emoji: '🛠️' },
      { label: 'Clear your evening for them', lang: 'quality', emoji: '⏳' },
    ],
  },
  {
    id: 'g2',
    scenario: 'You want to show love out of nowhere. You most naturally…',
    options: [
      { label: 'Pick up a little something they\'d love', lang: 'gifts', emoji: '🎁' },
      { label: 'Send a message telling them what they mean to you', lang: 'words', emoji: '📱' },
      { label: 'Plan something for just the two of you', lang: 'quality', emoji: '📅' },
      { label: 'Do the errand they\'ve been dreading', lang: 'acts', emoji: '📦' },
    ],
  },
  {
    id: 'g3',
    scenario: 'When you apologize, what do you add to make it real?',
    options: [
      { label: 'The full, spoken explanation of what you\'ll change', lang: 'words', emoji: '🗣️' },
      { label: 'A hug that says what words can\'t', lang: 'touch', emoji: '🫂' },
      { label: 'Immediately fixing what went wrong', lang: 'acts', emoji: '🔧' },
      { label: 'Undivided time to reconnect', lang: 'quality', emoji: '🕯️' },
    ],
  },
  {
    id: 'g4',
    scenario: 'Be honest: how do you usually say "I love you" without saying it?',
    options: [
      { label: 'Compliments and encouragement', lang: 'words', emoji: '💬' },
      { label: 'Casual touches all day long', lang: 'touch', emoji: '🤝' },
      { label: 'Doing things so their life is easier', lang: 'acts', emoji: '🧹' },
      { label: 'Small surprises and remembered details', lang: 'gifts', emoji: '🎀' },
    ],
  },
];

export function scoreLanguages(answers) {
  const tally = { words: 0, touch: 0, quality: 0, acts: 0, gifts: 0 };
  Object.values(answers).forEach((lang) => {
    if (tally[lang] !== undefined) tally[lang] += 1;
  });
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][1] > 0 ? sorted[1][0] : null, tally };
}
