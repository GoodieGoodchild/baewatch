/**
 * Returns 3-5 personalised suggestion objects { icon, title, description }
 * based on current relationship state.
 */
export function getSuggestions({ profile = {}, connectionLevel = 72, weatherMood = 'cloudy', checkInHistory = [] }) {
  const { partnerName = 'your partner', supportPreference = '', currentMood = '', cupFullness = 72 } = profile;

  const pool = [];

  // Low connection or rainy weather
  if (weatherMood === 'rainy' || connectionLevel < 50) {
    pool.push(
      { icon: '💬', title: 'Open the conversation', description: 'Ask: What would help you feel close to me again?', score: 3 },
      { icon: '🤗', title: 'Repair first', description: 'A long hug (7+ seconds) releases oxytocin and resets the mood.', score: 3 },
      { icon: '☕', title: 'Small gesture', description: `Make ${partnerName} something warm and comforting.`, score: 2 },
    );
  }

  // Support preference: Quality time
  if (supportPreference === 'Quality time') {
    pool.push(
      { icon: '🎬', title: 'Screen-free evening', description: 'Put the phones away and just be present together.', score: 2 },
      { icon: '🚶', title: 'Walk and talk', description: 'Side-by-side conversation is easier than face-to-face.', score: 2 },
    );
  }

  // Support preference: Words of affirmation
  if (supportPreference === 'Words of affirmation') {
    pool.push(
      { icon: '💌', title: 'Write it down', description: `Leave ${partnerName} a note about something specific you admire.`, score: 2 },
      { icon: '🗣️', title: 'Say it out loud', description: 'Tell them one thing they did this week that meant a lot to you.', score: 2 },
    );
  }

  // Support preference: Acts of service
  if (supportPreference === 'Acts of service') {
    pool.push(
      { icon: '🧹', title: 'Take something off their plate', description: 'Handle one task they usually do without being asked.', score: 2 },
      { icon: '🛒', title: 'Anticipate a need', description: `Think of something ${partnerName} needs and just do it.`, score: 2 },
    );
  }

  // Support preference: Physical touch
  if (supportPreference === 'Physical touch') {
    pool.push(
      { icon: '🤝', title: 'Reach for them', description: 'Hold hands, a hand on the shoulder — small touch matters.', score: 2 },
      { icon: '💆', title: 'Offer a massage', description: 'Even 5 minutes of shoulder tension relief says "I see you."', score: 2 },
    );
  }

  // Stressed or overwhelmed mood
  const moodLower = (currentMood || '').toLowerCase();
  if (moodLower.includes('stress') || moodLower.includes('overwhelm')) {
    pool.push(
      { icon: '🫁', title: 'Give them space to vent', description: 'Listen without fixing. Just say "I hear you."', score: 3 },
      { icon: '🧘', title: 'Create calm', description: 'Dim the lights, put on soft music, reduce chaos around them.', score: 2 },
    );
  }

  // High cup fullness
  if (cupFullness >= 75) {
    pool.push(
      { icon: '🌟', title: 'Celebrate the good', description: `${partnerName}'s cup is full — build on this momentum.`, score: 1 },
      { icon: '🎉', title: 'Plan something fun', description: 'High-connection moments are great for trying something new together.', score: 1 },
    );
  }

  // Always include wildcard
  const wildcard = {
    icon: '❓',
    title: 'Ask the question',
    description: `"What would make today feel really good for you, ${partnerName}?"`,
    score: 1,
  };

  // Sort by score descending, deduplicate, take top 3, add wildcard if not already 3
  const seen = new Set();
  const sorted = pool
    .filter((s) => {
      if (seen.has(s.title)) return false;
      seen.add(s.title);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (sorted.length < 3) {
    sorted.push(wildcard);
  }

  // Strip score before returning
  return sorted.map(({ score, ...rest }) => rest);
}
