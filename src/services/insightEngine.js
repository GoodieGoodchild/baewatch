const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns the most common emotional state id from history (last 14 entries).
 */
export function topEmotionalState(checkInHistory) {
  if (!checkInHistory || checkInHistory.length === 0) return null;
  const recent = checkInHistory.slice(-14);
  const counts = {};
  for (const entry of recent) {
    if (entry.stateId) {
      counts[entry.stateId] = (counts[entry.stateId] || 0) + 1;
    }
  }
  let top = null;
  let max = 0;
  for (const [id, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      top = id;
    }
  }
  return top;
}

/**
 * Returns connection level trend: 'rising' | 'falling' | 'stable'
 * Based on last entries in connectionLevelHistory.
 */
export function connectionTrend(connectionLevelHistory) {
  if (!connectionLevelHistory || connectionLevelHistory.length < 3) return 'stable';
  const recent = connectionLevelHistory.slice(-7);
  const first = recent.slice(0, Math.floor(recent.length / 2));
  const second = recent.slice(Math.floor(recent.length / 2));
  const avgFirst = first.reduce((s, e) => s + e.value, 0) / first.length;
  const avgSecond = second.reduce((s, e) => s + e.value, 0) / second.length;
  const diff = avgSecond - avgFirst;
  if (diff >= 5) return 'rising';
  if (diff <= -5) return 'falling';
  return 'stable';
}

/**
 * Returns day-of-week (0=Sun...6=Sat) that has lowest avg cupFullness.
 * Returns null if not enough data.
 */
export function lowDayOfWeek(checkInHistory) {
  if (!checkInHistory || checkInHistory.length < 5) return null;
  const byDay = {};
  for (const entry of checkInHistory) {
    const date = new Date(entry.date || entry.timestamp);
    const dow = date.getDay();
    if (!byDay[dow]) byDay[dow] = [];
    byDay[dow].push(entry.cupFullness ?? 72);
  }
  let lowestDay = null;
  let lowestAvg = Infinity;
  for (const [dow, values] of Object.entries(byDay)) {
    if (values.length < 2) continue;
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestDay = parseInt(dow, 10);
    }
  }
  return lowestDay;
}

/**
 * Returns relationship health score 0-100.
 */
export function calculateHealthScore({ checkInHistory, connectionLevelHistory, currentConnectionLevel, currentCupFullness }) {
  let score = 60;

  // +5 per check-in in last 7 days (max +20)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCheckIns = (checkInHistory || []).filter((e) => {
    const d = new Date(e.date || e.timestamp);
    return d >= sevenDaysAgo;
  });
  score += Math.min(recentCheckIns.length * 5, 20);

  // Connection trend
  const trend = connectionTrend(connectionLevelHistory);
  if (trend === 'rising') score += 10;
  if (trend === 'falling') score -= 10;

  // Avg cupFullness last 7 days
  if (recentCheckIns.length > 0) {
    const avgCup = recentCheckIns.reduce((s, e) => s + (e.cupFullness ?? 72), 0) / recentCheckIns.length;
    if (avgCup >= 70) score += 10;
    if (avgCup < 40) score -= 10;
  } else {
    // Fall back to current
    if ((currentCupFullness ?? 72) >= 70) score += 10;
    if ((currentCupFullness ?? 72) < 40) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Returns array of insight objects { type, message, emoji, priority }
 */
export function analyzePatterns(checkInHistory, connectionLevelHistory) {
  const insights = [];
  if (!checkInHistory) checkInHistory = [];
  if (!connectionLevelHistory) connectionLevelHistory = [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7 = checkInHistory.filter((e) => {
    const d = new Date(e.date || e.timestamp);
    return d >= sevenDaysAgo;
  });

  // Less than 3 check-ins in last 7 days
  if (last7.length < 3) {
    insights.push({
      type: 'frequency',
      emoji: '📊',
      message: 'More check-ins help us understand patterns better. Try checking in daily.',
      priority: 2,
    });
  }

  // Top emotional state overwhelmed/exhausted
  const drainingStates = ['overwhelmed', 'exhausted', 'drained'];
  const drainingCount = last7.filter((e) => drainingStates.includes((e.stateId || '').toLowerCase())).length;
  if (drainingCount >= 3) {
    insights.push({
      type: 'emotional',
      emoji: '😴',
      message: 'Your partner has been drained this week. Extra gentleness goes a long way.',
      priority: 1,
    });
  }

  // Low day of week
  const lowDay = lowDayOfWeek(checkInHistory);
  if (lowDay !== null) {
    const dayName = DAY_NAMES[lowDay];
    insights.push({
      type: 'pattern',
      emoji: '📅',
      message: `Your partner tends to feel lower on ${dayName}s. Plan something thoughtful for next ${dayName}.`,
      priority: 2,
    });
  }

  // Connection falling
  const trend = connectionTrend(connectionLevelHistory);
  const recent5 = connectionLevelHistory.slice(-5);
  if (trend === 'falling' && recent5.length >= 5) {
    insights.push({
      type: 'connection',
      emoji: '⚠️',
      message: 'Connection has been dipping. A repair conversation might help.',
      priority: 1,
    });
  }

  if (trend === 'rising') {
    insights.push({
      type: 'connection',
      emoji: '📈',
      message: "Connection is growing! You're doing something right this week.",
      priority: 3,
    });
  }

  // Cup fullness consistently high
  if (last7.length >= 5) {
    const allHigh = last7.every((e) => (e.cupFullness ?? 0) > 80);
    if (allHigh) {
      insights.push({
        type: 'cup',
        emoji: '🌟',
        message: "Your partner's cup has been full all week — you're doing amazing.",
        priority: 3,
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
