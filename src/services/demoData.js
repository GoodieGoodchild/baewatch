// demoData.js — a realistic "one month in" couple for exploring the app.
//
// The story: Sam (you) is avoidant — when conflict rises, Sam goes quiet,
// withdraws, and rarely returns to finish the repair conversation about what
// will change. Maya is anxious and autistic — she needs clear words, repeats
// herself trying to be heard, and has started to feel like nothing she says
// matters. They're just discovering these patterns in each other. Nothing here
// forces either person to change; it shows each what the other needs and offers
// small, optional steps.

const DAY = 86400000;
const iso = (d) => new Date(d).toISOString();
const dayStr = (d) => new Date(d).toISOString().slice(0, 10);

export function buildDemoData() {
  const now = Date.now();
  const daysAgo = (n) => now - n * DAY;

  // Sam's own check-ins across the month — mostly withdrawn/overwhelmed with a
  // few tender recoveries. Connection trends downward as ruptures go unrepaired.
  const checkInSeed = [
    { n: 30, stateId: 'loving', moodLabel: 'Full of love', cup: 82, conn: 74, note: 'First month together felt easy. Everything clicked.', needs: [] },
    { n: 27, stateId: 'affectionate', moodLabel: 'Affectionate', cup: 78, conn: 73, note: '', needs: ['Physical affection'] },
    { n: 24, stateId: 'okay', moodLabel: 'Okay', cup: 66, conn: 70, note: 'Small disagreement about plans. Let it go.', needs: [] },
    { n: 21, stateId: 'overwhelmed', moodLabel: 'Overwhelmed', cup: 48, conn: 64, note: 'She wanted to talk it out and I just needed to disappear for a bit.', needs: ['Give me space'] },
    { n: 18, stateId: 'disconnected', moodLabel: 'Disconnected', cup: 42, conn: 60, note: "Went quiet again. I know it hurt her but I couldn't find words.", needs: ['Give me space'] },
    { n: 15, stateId: 'okay', moodLabel: 'Okay', cup: 58, conn: 62, note: 'Good day. We laughed. Didn\'t bring up the argument.', needs: [] },
    { n: 12, stateId: 'overwhelmed', moodLabel: 'Overwhelmed', cup: 40, conn: 55, note: 'She said she feels unheard. I froze and left the room.', needs: ['Give me space'] },
    { n: 9, stateId: 'exhausted', moodLabel: 'Exhausted', cup: 44, conn: 54, note: 'Tired of getting it wrong.', needs: ['Just listen'] },
    { n: 6, stateId: 'anxious', moodLabel: 'Anxious', cup: 46, conn: 53, note: 'Want to fix it but scared of another hard conversation.', needs: ['Reassure me'] },
    { n: 3, stateId: 'okay', moodLabel: 'Okay', cup: 52, conn: 54, note: 'Tried to sit closer on the couch. Small step.', needs: ['Physical affection'] },
    { n: 1, stateId: 'reassured', moodLabel: 'Held & safe', cup: 60, conn: 56, note: 'She held my hand first. It mattered more than she knows.', needs: ['Physical affection'] },
  ];

  const checkInHistory = checkInSeed.map((c) => ({
    date: dayStr(daysAgo(c.n)),
    timestamp: iso(daysAgo(c.n)),
    stateId: c.stateId,
    moodLabel: c.moodLabel,
    cupFullness: c.cup,
    connectionLevel: c.conn,
    note: c.note,
    needs: c.needs,
  }));

  const connectionLevelHistory = checkInSeed
    .slice(-14)
    .map((c) => ({ date: dayStr(daysAgo(c.n)), value: c.conn }));

  return {
    profile: {
      yourName: 'Sam',
      partnerName: 'Maya',
      nickname: 'Maya',
      relationshipStage: 'together',
      relationshipLength: 'Just over a month',
      yourMood: 'stressed',
      yourNeed: 'space',
      yourLoveLanguage: 'touch',
      yourGivingLanguage: 'quality',
      partnerLoveLanguage: 'words',
      cupFullness: 46,
      partnerNotes: 'Maya is autistic — clear, spoken reassurance genuinely helps her. Silence reads as rejection.',
    },

    connectionLevel: 56,
    weatherMood: 'rainy',
    lastCheckIn: dayStr(daysAgo(1)),

    checkInHistory,
    connectionLevelHistory,

    // Sam's self-insight — the avoidant map.
    selfInsight: {
      dominant: 'avoidant',
      quizAnswers: {
        conflict: 'avoidant',
        needs: 'avoidant',
        space: 'avoidant',
        closeness: 'avoidant',
        stress: 'avoidant',
      },
      traumaResponses: ['withdraw', 'shutdown', 'flee'],
      neurodivergence: [],
      freeText:
        "When she pushes for a conversation, I feel cornered and go silent. It's not that I don't care — I flood and shut down, then I never circle back.",
      card: {
        headline: 'You love deeply, but retreat to feel safe.',
        whatIDo:
          'When conflict heats up, you go quiet and withdraw — sometimes leaving the room or the conversation entirely.',
        whatItMeans:
          'Silence is how your nervous system self-soothes when overwhelmed. It is protection, not rejection — and the hardest part is coming back.',
        howItLands:
          "To Maya, your silence can feel like abandonment — like she and her feelings simply don't matter.",
        whatHelps: [
          "A few words before you retreat: 'I need 20 minutes — I'm not leaving you.'",
          'Come back to the conversation once you\'re calm. The return matters more than the pause.',
          'A hand on her shoulder before you take space.',
        ],
        myCommitment: 'I will tell Maya I need space instead of disappearing — and I will come back.',
      },
      updatedAt: iso(daysAgo(4)),
    },

    // What Sam is learning about Maya — the anxious/autistic map. (In a fully
    // paired setup this syncs from Maya's own device.)
    partnerInsight: {
      dominant: 'anxious',
      neurodivergence: ['Autistic', 'Anxiety'],
      traumaResponses: ['I repeat myself to be heard', 'I seek reassurance', 'I get critical when scared'],
      card: {
        headline: 'Maya loves loudly and fears being unheard.',
        whatIDo: 'She repeats herself and reaches harder for reassurance when she senses distance.',
        whatItMeans:
          'Repeating is how she tries to feel heard. As an autistic partner, clear words are a real need — not nagging.',
        howItLands:
          "When you go quiet, she escalates to be heard, then concludes that nothing she says matters.",
        whatHelps: [
          "Reflect her words back: 'What I hear you saying is…'",
          'Reassure with specifics, out loud — not just in your head.',
          "Don't go silent. Even 'I hear you, give me a moment' lands.",
        ],
        herCommitment: 'I will say what I need once, clearly, and trust that it landed.',
      },
    },

    // What Maya's device would publish to the shared relationship doc.
    partnerSync: {
      name: 'Maya',
      loveLanguage: 'words',
      mood: 'anxious',
      cupFullness: 41,
      lastCheckIn: dayStr(daysAgo(0)),
      latestCheckIn: {
        date: dayStr(daysAgo(0)),
        stateId: 'anxious',
        moodLabel: 'Anxious',
        note: "I keep wondering if I said too much again yesterday. I don't want to push him away, I just want to know we're okay.",
        needs: ['Reassure me', 'Just listen'],
      },
      attachmentStyle: 'anxious',
      insightCard: null, // demo sets partnerInsight directly below instead
      commitment: 'I will say what I need once, clearly, and trust that it landed.',
      givingLanguage: 'acts',
      // Maya's Manual of Me — written once on a calm day, surfaced to Sam
      // automatically on days like today.
      manual: {
        anxious: {
          means: "My brain is hunting for proof that we're okay. I'm not trying to start a fight — I'm trying to end the one in my head.",
          helps: "Tell me, in actual words, that we're okay and you're not going anywhere. Once, clearly. Then hold my hand.",
        },
        quiet: {
          means: "If I've gone quiet, I've usually given up on being heard — that's a five-alarm signal for me.",
          helps: 'Come to me first. Ask one gentle question and let me answer all the way.',
        },
        overwhelmed: {
          means: 'Too many inputs — feelings included. Autistic overwhelm is physical, not dramatic.',
          helps: 'Lower the volume of everything. Dim room, no big talks, sit with me.',
        },
        hurt: {
          means: "I'll repeat myself when hurt because last time it didn't land. Repetition = it still matters.",
          helps: 'Reflect my words back before you respond. "What I hear you saying is…" works like magic.',
        },
        neverSay: "You're overreacting",
        alwaysWorks: 'Reach for my hand first. Words after.',
      },
    },

    // Live repair request: Maya finished the repair guide on her device and
    // the app is now asking SAM (the viewer) what would feel best for him.
    repairRequest: {
      from: 'demo-maya',
      fromName: 'Maya',
      createdAt: iso(daysAgo(0)),
      status: 'choosing',
      choice: null,
    },

    // Sam's own manual (partially filled — nudges him to finish it).
    manual: {
      quiet: {
        means: "I'm regulating, not rejecting you. The silence is me trying NOT to say something I'd regret.",
        helps: "Give me 20 minutes without follow-up questions. I promise I'll come back — hold me to it.",
      },
      anxious: { means: '', helps: '' },
      overwhelmed: { means: '', helps: '' },
      hurt: { means: '', helps: '' },
      neverSay: 'We need to talk, NOW',
      alwaysWorks: 'Sit next to me. Contact before conversation.',
    },

    // A precomputed bridge between the two styles (what the AI would generate).
    connectionBridge: {
      dynamic:
        'A classic pursue–withdraw dance: Maya reaches harder as Sam pulls back, and each move confirms the other\'s deepest fear.',
      flashpoint: 'The moment a disagreement starts and Sam goes quiet — Maya pursues, Sam retreats further.',
      forA: "Sam: when the urge to disappear hits, say one sentence first — 'I need a short break, I'm coming back.'",
      forB: 'Maya: when Sam goes quiet, soften the approach and give a small window — pursuing harder pushes him further away.',
      sharedRitual: "A nightly 10-minute 'no-fix' check-in: each person is only heard, not answered or corrected.",
      reframe:
        "Sam's need for calm and Maya's need for words aren't enemies — together they can build a rhythm of space and reassurance.",
    },

    // The heart of the story: repair conversations that were started but never
    // finished. Both are still OPEN — Sam hasn't come back to them.
    repairCommitments: [
      {
        text: 'tell Maya I need space instead of going silent, and come back within the hour',
        date: iso(daysAgo(12)),
        done: false,
      },
      {
        text: 'reflect back what she says before I jump to defending myself',
        date: iso(daysAgo(25)),
        done: false,
      },
    ],

    dailyAnswers: {
      [dayStr(daysAgo(2))]: "The moment I felt closest to Maya was when she reached for my hand without a word.",
      [dayStr(daysAgo(5))]: "Something I've never told her: her voice is the thing that calms me down, even when I go quiet.",
      [dayStr(daysAgo(8))]: "I admire how hard she keeps trying, even when I make it difficult.",
    },

    bucketList: [
      { id: 1, title: 'Take a weekend trip to the coast', category: 'adventure', completed: false },
      { id: 2, title: 'Learn to cook her favourite meal from scratch', category: 'growth', completed: false },
      { id: 3, title: 'Have one full conversation without either of us shutting down', category: 'connection', completed: false },
      { id: 4, title: 'Watched the sunrise together', category: 'connection', completed: true, completedAt: iso(daysAgo(20)) },
      { id: 5, title: 'Wrote each other letters', category: 'connection', completed: true, completedAt: iso(daysAgo(28)) },
    ],

    memories: [
      { id: 1, emoji: '🌅', title: 'First sunrise together', value: 'The morning at the pier — quiet, hopeful, easy.', category: 'milestone', date: dayStr(daysAgo(28)) },
      { id: 2, emoji: '💌', title: 'The letters', value: "She wrote three pages. I wrote half a page but meant every word.", category: 'gesture', date: dayStr(daysAgo(28)) },
      { id: 3, emoji: '🤝', title: 'She reached first', value: 'After a hard week, she held my hand before I found the words.', category: 'repair', date: dayStr(daysAgo(1)) },
    ],

    recentWins: [
      { id: 1, title: 'Sat closer instead of pulling away', timestamp: iso(daysAgo(3)) },
      { id: 2, title: 'Said "I hear you" out loud', timestamp: iso(daysAgo(6)) },
    ],

    adaptiveSignals: {
      affectionProfile: 'touch-forward but withdraws under stress',
      stressRhythm: 'floods quickly, needs 20+ min to reset',
      supportPreferences: 'space first, then reconnection',
      conversationStyle: 'goes quiet before going deep',
    },

    weeklyRecap: { weekOf: '', dismissed: false },
    growthGoals: [],
    plannedDates: [],
    timeline: [],
  };
}

export default buildDemoData;
