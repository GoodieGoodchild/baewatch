const DATE_IDEAS = [
  {
    id: 'cook-together',
    title: 'Cook a New Recipe Together',
    description: 'Pick a cuisine neither of you has tried making, put on some music, and make dinner an adventure.',
    emoji: '🍳',
    duration: '2–3 hours',
    cost: 'low',
    energyLevel: 'medium',
    tags: ['quality-time', 'creative', 'cosy'],
    bestFor: ['quality-time', 'acts-of-service'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'sunset-walk',
    title: 'Sunset Walk + Coffee',
    description: 'Stroll somewhere beautiful as the sun goes down, then find a cosy spot for a warm drink.',
    emoji: '🌅',
    duration: '1–2 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'outdoors'],
    bestFor: ['quality-time', 'physical-touch'],
    moodBoost: ['sunny', 'cloudy'],
  },
  {
    id: 'first-date-recreate',
    title: 'Recreate Your First Date',
    description: 'Go back to where it all began. Same place, same energy — but now you know each other so much better.',
    emoji: '💑',
    duration: '2–4 hours',
    cost: 'medium',
    energyLevel: 'medium',
    tags: ['quality-time', 'connection', 'nostalgic'],
    bestFor: ['quality-time', 'words-of-affirmation', 'acts-of-service', 'physical-touch', 'gifts'],
    moodBoost: ['sunny', 'cloudy', 'rainy'],
  },
  {
    id: 'spa-night',
    title: 'At-Home Spa Night',
    description: 'Face masks, candles, soft playlists, and taking turns pampering each other.',
    emoji: '🛁',
    duration: '2 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'cosy', 'physical-touch'],
    bestFor: ['physical-touch', 'quality-time'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'farmers-market',
    title: 'Farmers Market Morning',
    description: 'Wander slowly, pick up something fresh, and have breakfast or brunch with your finds.',
    emoji: '🥦',
    duration: '2–3 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'outdoors'],
    bestFor: ['quality-time', 'acts-of-service'],
    moodBoost: ['sunny'],
  },
  {
    id: 'youtube-class',
    title: 'Learn Something Together',
    description: "Find a YouTube tutorial for something you're both curious about — pottery, calligraphy, coding, bread.",
    emoji: '🎓',
    duration: '1–2 hours',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'learning', 'creative'],
    bestFor: ['quality-time', 'words-of-affirmation'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'letters-aloud',
    title: 'Write Letters, Read Them Aloud',
    description: 'Each write a letter to the other — about what you love, what you hope for — then read them aloud together.',
    emoji: '✉️',
    duration: '1 hour',
    cost: 'free',
    energyLevel: 'low',
    tags: ['connection', 'words-of-affirmation', 'cosy'],
    bestFor: ['words-of-affirmation', 'quality-time'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'stargazing',
    title: 'Stargazing with Blankets',
    description: 'Find a dark spot, bring blankets and hot drinks, and just look up and talk.',
    emoji: '🌟',
    duration: '1–2 hours',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'outdoors', 'cosy', 'physical-touch'],
    bestFor: ['physical-touch', 'quality-time'],
    moodBoost: ['sunny'],
  },
  {
    id: 'photo-adventure',
    title: 'Photo Adventure',
    description: 'Pick a new neighbourhood or park, take photos together, and see yourselves in a new light.',
    emoji: '📸',
    duration: '2–3 hours',
    cost: 'free',
    energyLevel: 'medium',
    tags: ['quality-time', 'outdoors', 'creative', 'memories'],
    bestFor: ['quality-time', 'gifts'],
    moodBoost: ['sunny', 'cloudy'],
  },
  {
    id: 'board-game-night',
    title: 'Board Game Night, No Phones',
    description: "Pick something you haven't played before. Phones in the drawer. Full presence only.",
    emoji: '🎲',
    duration: '2 hours',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'cosy', 'fun'],
    bestFor: ['quality-time'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'volunteer',
    title: 'Volunteer Together',
    description: 'Give a few hours to a cause you both care about. Shared purpose is deeply bonding.',
    emoji: '🤝',
    duration: '3–4 hours',
    cost: 'free',
    energyLevel: 'medium',
    tags: ['acts-of-service', 'connection', 'quality-time'],
    bestFor: ['acts-of-service', 'quality-time'],
    moodBoost: ['sunny'],
  },
  {
    id: 'dream-trip',
    title: 'Plan Your Dream Trip',
    description: "Even if you can't go yet — open a map, pick a destination, and plan it properly. Half the fun is the imagining.",
    emoji: '🗺️',
    duration: '1–2 hours',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'words-of-affirmation', 'adventure'],
    bestFor: ['quality-time', 'words-of-affirmation'],
    moodBoost: ['rainy', 'cloudy', 'sunny'],
  },
  {
    id: 'new-drive',
    title: 'Drive Somewhere New with No Destination',
    description: 'Just start driving. Follow your curiosity. Stop when something looks interesting.',
    emoji: '🚗',
    duration: '2–4 hours',
    cost: 'low',
    energyLevel: 'medium',
    tags: ['adventure', 'quality-time', 'outdoors'],
    bestFor: ['quality-time', 'physical-touch'],
    moodBoost: ['sunny', 'cloudy'],
  },
  {
    id: 'museum',
    title: 'Museum or Gallery Visit',
    description: 'Wander slowly, read everything, share reactions. Take turns picking the most interesting piece.',
    emoji: '🏛️',
    duration: '2–3 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'learning', 'low-key'],
    bestFor: ['quality-time', 'words-of-affirmation'],
    moodBoost: ['sunny', 'cloudy'],
  },
  {
    id: 'movie-marathon',
    title: "Movie Marathon of Their Favourites",
    description: 'Let them pick everything. Make their favourite snacks. Zero judgement. Total presence.',
    emoji: '🎬',
    duration: 'Full afternoon',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'cosy', 'acts-of-service'],
    bestFor: ['quality-time', 'acts-of-service'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'morning-hike',
    title: 'Morning Hike + Breakfast Out',
    description: 'Early start, fresh air, good views — then reward yourselves with a proper sit-down breakfast.',
    emoji: '🥾',
    duration: '3–4 hours',
    cost: 'low',
    energyLevel: 'high',
    tags: ['outdoors', 'quality-time', 'adventure'],
    bestFor: ['quality-time', 'physical-touch'],
    moodBoost: ['sunny'],
  },
  {
    id: 'playlist',
    title: 'Make a Playlist Together',
    description: 'Take turns adding songs — ones that remind you of each other, or that capture your relationship right now.',
    emoji: '🎵',
    duration: '1 hour',
    cost: 'free',
    energyLevel: 'low',
    tags: ['creative', 'words-of-affirmation', 'quality-time'],
    bestFor: ['words-of-affirmation', 'quality-time'],
    moodBoost: ['rainy', 'cloudy', 'sunny'],
  },
  {
    id: 'indoor-picnic',
    title: 'At-Home Picnic in the Living Room',
    description: 'Blanket on the floor, picnic basket, little bites, and a good playlist. Cosy magic, no weather required.',
    emoji: '🧺',
    duration: '1–2 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'cosy', 'creative'],
    bestFor: ['quality-time', 'acts-of-service'],
    moodBoost: ['rainy', 'cloudy'],
  },
  {
    id: 'sunrise',
    title: 'Watch the Sunrise Together',
    description: 'Set the alarm. Find a good spot. Watch the world wake up together. Worth every minute of lost sleep.',
    emoji: '🌄',
    duration: '1 hour',
    cost: 'free',
    energyLevel: 'low',
    tags: ['quality-time', 'outdoors', 'physical-touch', 'memories'],
    bestFor: ['physical-touch', 'quality-time'],
    moodBoost: ['sunny'],
  },
  {
    id: 'bookshop-cafe',
    title: 'Bookshop Browse + Café Read',
    description: 'Spend an hour in a bookshop, each pick something, then read together at a café. No agenda. Just peace.',
    emoji: '📖',
    duration: '2–3 hours',
    cost: 'low',
    energyLevel: 'low',
    tags: ['quality-time', 'cosy', 'low-key', 'learning'],
    bestFor: ['quality-time', 'words-of-affirmation'],
    moodBoost: ['rainy', 'cloudy', 'sunny'],
  },
];

export function getDateSuggestions({ supportPreference, partnerNeed, connectionLevel, weatherMood }) {
  const scored = DATE_IDEAS.map((idea) => {
    let score = 0;

    // +2 if bestFor matches supportPreference (love language)
    const prefKey = (supportPreference || '').toLowerCase().replace(/\s+/g, '-');
    if (idea.bestFor.some((b) => prefKey.includes(b) || b.includes(prefKey))) {
      score += 2;
    }

    // +2 if moodBoost matches weatherMood
    if (weatherMood && idea.moodBoost.includes(weatherMood)) {
      score += 2;
    }

    // +1 if low energy and low connection level
    if (idea.energyLevel === 'low' && (connectionLevel || 72) < 60) {
      score += 1;
    }

    // +1 if partnerNeed keyword matches a tag
    const needLower = (partnerNeed || '').toLowerCase();
    if (idea.tags.some((t) => needLower.includes(t) || t.includes(needLower.split(' ')[0]))) {
      score += 1;
    }

    return { ...idea, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export { DATE_IDEAS };
