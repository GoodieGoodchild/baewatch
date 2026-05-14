export const promptCategories = {
  connection: [
    {
      type: 'connection',
      mood: 'Warmth',
      emoji: '💕',
      title: 'Memory & Affection',
      prompt: 'What’s a moment with your person that still makes you smile?',
      context: 'Use this to gently build warmth and shared nostalgia.',
      signal: 'affection_profile',
      description: 'Strengthens emotional closeness and shared story.',
    },
    {
      type: 'connection',
      mood: 'Belonging',
      emoji: '🏡',
      title: 'Feeling at Home',
      prompt: 'What feels most like home when you’re with your person?',
      context: 'Great for building comfort and belonging.',
      signal: 'emotional_security',
      description: 'Reveals how safety and belonging are experienced together.',
    },
    {
      type: 'connection',
      mood: 'Playful',
      emoji: '😊',
      title: 'Joy & Laughter',
      prompt: 'What usually makes your person laugh without fail?',
      context: 'A sweet prompt for playful connection.',
      signal: 'humor_pattern',
      description: 'Captures what makes your connection feel light and alive.',
    },
  ],
  discovery: [
    {
      type: 'discovery',
      mood: 'Curious',
      emoji: '🧭',
      title: 'Stress Awareness',
      prompt: 'What drains your energy most often right now?',
      context: 'Helps identify pressure points without judgement.',
      signal: 'stress_profile',
      description: 'Surfaces current stressors and support needs.',
    },
    {
      type: 'discovery',
      mood: 'Support',
      emoji: '🤝',
      title: 'Quiet Support',
      prompt: 'What helps you feel supported without having to ask?',
      context: 'Great for learning how to offer help naturally.',
      signal: 'support_style',
      description: 'Reveals how your person prefers to receive care.',
    },
    {
      type: 'discovery',
      mood: 'Mindful',
      emoji: '🧠',
      title: 'Hidden Thoughts',
      prompt: 'What’s been on your mind this week that I might not know?',
      context: 'Invites gentle sharing of unseen feelings.',
      signal: 'emotional_awareness',
      description: 'Helps surface what matters beneath the surface.',
    },
  ],
  repair: [
    {
      type: 'repair',
      mood: 'Reconnection',
      emoji: '🌿',
      title: 'Rebuild Together',
      prompt: 'What helps you feel close again after a hard day?',
      context: 'Use after tension or a difficult moment.',
      signal: 'repair_style',
      description: 'Shows the most calming way to reconnect.',
    },
    {
      type: 'repair',
      mood: 'Understanding',
      emoji: '💬',
      title: 'What You Wish I Knew',
      prompt: 'What’s something you wish your person understood better lately?',
      context: 'Safe way to invite honest sharing.',
      signal: 'communication_style',
      description: 'Builds understanding without blame.',
    },
    {
      type: 'repair',
      mood: 'Nostalgia',
      emoji: '✨',
      title: 'Missing Us',
      prompt: 'What’s one thing you miss doing together right now?',
      context: 'A gentle bridge back to shared rhythm.',
      signal: 'intimacy_pattern',
      description: 'Reveals what brings you both back together.',
    },
  ],
};

export const categoryLabels = {
  connection: 'Connection Prompts',
  discovery: 'Discovery Prompts',
  repair: 'Repair Prompts',
};

export const getPrompt = (category, index = 0) => {
  const items = promptCategories[category] || promptCategories.connection;
  return items[index % items.length];
};

export const getPromptCategories = () => Object.keys(promptCategories);

export const extractRelationshipSignals = (answer) => {
  const normalized = answer?.toLowerCase?.() || '';
  const signals = {
    love_language_signal: null,
    emotional_need: null,
    relationship_sentiment: 'neutral',
    communication_style: null,
  };

  if (normalized.includes('help') || normalized.includes('support')) {
    signals.emotional_need = 'support';
  }
  if (normalized.includes('noticed') || normalized.includes('seen')) {
    signals.emotional_need = 'feeling noticed';
  }
  if (normalized.includes('laugh') || normalized.includes('funny')) {
    signals.communication_style = 'humor';
  }
  if (normalized.includes('space') || normalized.includes('quiet')) {
    signals.communication_style = 'gentle distance';
  }
  if (normalized.includes('appreciate') || normalized.includes('thank')) {
    signals.relationship_sentiment = 'positive';
  }
  if (normalized.includes('tired') || normalized.includes('stress') || normalized.includes('overwhelmed')) {
    signals.relationship_sentiment = 'stressed';
  }

  return signals;
};
