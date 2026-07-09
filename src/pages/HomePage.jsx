import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import RelationshipWeatherWidget from '../components/widgets/RelationshipWeatherWidget';
import ConnectionLevelWidget from '../components/widgets/ConnectionLevelWidget';
import InsightCard from '../components/cards/InsightCard';
import { Heart, Zap, TrendingUp, Edit, X, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { partnerReminder } from '../services/loveLanguages';
import { attachmentStyles } from '../services/attachmentProfiles';

const questions = [
  "What made you feel most loved this week?",
  "What's a dream we haven't talked about yet?",
  "What would a perfect day with me look like?",
  "What's something I do that always makes you smile?",
  "What's one thing you'd love us to do more of?",
  "What does feeling truly understood by me look like?",
  "What's your favourite memory of us together?",
  "What does home feel like when you're with me?",
  "What's something you appreciate that I do without being asked?",
  "What's one thing you wish I knew about how you're feeling lately?",
  "If we had a free weekend with no plans, what would you want to do?",
  "What's a goal I could help you with right now?",
  "What's the last thing I said that really stayed with you?",
  "When do you feel most connected to me?",
  "What would help you feel most supported this week?",
  "What's something you've been wanting to tell me but haven't yet?",
  "What's a new experience you'd love for us to try?",
  "What do you love most about our relationship?",
  "How do you know when I'm proud of you?",
  "What does a good argument resolution look like to you?",
  "What small gesture means the most to you?",
  "What's something you admire about the person you're becoming?",
  "What's one thing I could do to make your mornings better?",
  "What's a strength of mine you rely on?",
  "What makes you feel safe with me?",
  "What's something you're really looking forward to?",
  "What's something you want us to get better at together?",
  "When was the last time you felt really seen by me?",
  "What's the best compliment I've ever given you?",
  "What does love mean to you right now?"
];

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

const getCurrentWeekString = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

const getLastNDaysStr = (n) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
};

const moodEmojis = {
  overwhelmed: '😵',
  disconnected: '😢',
  affectionate: '😍',
  exhausted: '😴',
  reassurance: '🤗',
  space: '😌',
  anxious: '😰',
  loving: '💕',
};

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { relationshipData, dismissWeeklyRecap, dismissRepairCommitment, demoMode, exitDemo, isPaired, chooseRepairOption, closeRepair, recordLanguageWin } = useApp();
  const { currentUser } = useAuth();
  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your person';
  const cupFullness = profile.cupFullness ?? 72;

  const checkInHistory = relationshipData.checkInHistory || [];
  const weeklyRecap = relationshipData.weeklyRecap || { weekOf: '', dismissed: false };
  const dailyAnswers = relationshipData.dailyAnswers || {};
  const bucketList = relationshipData.bucketList || [];

  const todayStr = new Date().toISOString().slice(0, 10);
  const answeredToday = !!dailyAnswers[todayStr];
  const todayQuestion = questions[getDayOfYear() % questions.length];
  const truncatedQuestion = todayQuestion.length > 80 ? todayQuestion.slice(0, 80) + '...' : todayQuestion;

  const currentWeek = getCurrentWeekString();
  const isSunday = new Date().getDay() === 0;
  const showRecap = isSunday || (weeklyRecap.weekOf !== currentWeek);

  const last7Days = getLastNDaysStr(7);
  const weekCheckIns = checkInHistory.filter((c) => last7Days.includes(c.date));
  const hasEnoughData = weekCheckIns.length >= 2;
  const avgCup = hasEnoughData
    ? Math.round(weekCheckIns.reduce((s, c) => s + (c.cupFullness || 0), 0) / weekCheckIns.length)
    : 0;
  const firstConn = weekCheckIns.length > 0 ? weekCheckIns[0].connectionLevel : null;
  const lastConn = weekCheckIns.length > 0 ? weekCheckIns[weekCheckIns.length - 1].connectionLevel : null;
  const connDelta = firstConn !== null && lastConn !== null ? lastConn - firstConn : null;
  const connArrow = connDelta === null ? '→' : connDelta > 0 ? '↑' : connDelta < 0 ? '↓' : '→';
  const topMoodCounts = weekCheckIns.reduce((acc, c) => {
    if (c.stateId) acc[c.stateId] = (acc[c.stateId] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(topMoodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const showRepairBanner = relationshipData.weatherMood === 'rainy' || (relationshipData.connectionLevel ?? 72) < 50;
  const activeCommitment = (relationshipData.repairCommitments || []).find((c) => !c.done);
  const selfInsight = relationshipData.selfInsight;
  const bridge = relationshipData.connectionBridge;
  const partnerCheckIn = relationshipData.partnerSync?.latestCheckIn;

  // Repair request: am I the one who apologized, or the one being asked?
  const myUid = demoMode ? 'me' : currentUser?.uid;
  const repairReq = relationshipData.repairRequest;
  const iAmApologizer = repairReq && repairReq.from === myUid;
  const repairOptions = [
    { id: 'talk', emoji: '🗣️', label: 'A calm conversation about it' },
    { id: 'fun', emoji: '🎡', label: 'A light, fun night out — no heavy talk' },
    { id: 'space', emoji: '🌙', label: 'A little space first, then reconnect' },
    { id: 'words', emoji: '💌', label: 'Words — write me what you told the app' },
    { id: 'act', emoji: '🛠️', label: 'Show me — a small act of care' },
    { id: 'closeness', emoji: '🫂', label: 'Physical closeness — a long hug' },
  ];
  const chosenOption = repairReq?.choice ? repairOptions.find((o) => o.id === repairReq.choice) : null;

  // Partner's Manual of Me, opened to the page that matches how they feel today.
  const partnerManual = relationshipData.partnerSync?.manual;
  const manualKeyByState = {
    anxious: 'anxious', overwhelmed: 'overwhelmed', disconnected: 'hurt',
    exhausted: 'overwhelmed', okay: null, reassured: null, affectionate: null, loving: null,
  };
  const manualKey = partnerCheckIn ? manualKeyByState[partnerCheckIn.stateId] : null;
  const manualEntry = manualKey && partnerManual?.[manualKey];
  const manualHasContent = manualEntry && (manualEntry.means || manualEntry.helps);

  // Growth edge: one small practice at your attachment style's edge.
  const myStyle = relationshipData.selfInsight?.dominant;
  const growthEdges = {
    avoidant: 'Once this week, say "I need a minute — I\'m not leaving" instead of just going quiet.',
    anxious: 'Once this week, say your need once, clearly — then let it land without repeating it.',
    secure: 'Once this week, name out loud one thing your partner did that made you feel safe.',
    disorganized: 'Once this week, pause and ask yourself: is this the longing talking, or the fear?',
  };
  const growthEdge = myStyle ? growthEdges[myStyle] : null;

  // Passive pattern noticing: 3+ of the same difficult state in 14 days.
  const last14 = getLastNDaysStr(14);
  const recentDifficult = checkInHistory.filter(
    (c) => last14.includes(c.date) && ['overwhelmed', 'disconnected', 'anxious'].includes(c.stateId)
  );
  const patternCounts = recentDifficult.reduce((acc, c) => { acc[c.stateId] = (acc[c.stateId] || 0) + 1; return acc; }, {});
  const patternEntry = Object.entries(patternCounts).find(([, n]) => n >= 3);
  const patternLabel = patternEntry ? { overwhelmed: 'overwhelmed', disconnected: 'disconnected', anxious: 'anxious' }[patternEntry[0]] : null;
  const llReminder = partnerReminder(profile.partnerName, profile.partnerLoveLanguage);
  const [repairDismissed, setRepairDismissed] = useState(false);

  const activeBucketItems = bucketList.filter((i) => !i.completed);
  const topBucketPreview = activeBucketItems.slice(0, 2);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'games') onNavigate?.('games');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const cupMessage = () => {
    if (cupFullness >= 80) return 'Their cup is feeling full and warm.';
    if (cupFullness >= 60) return 'They are doing okay, but a refill would be nice.';
    if (cupFullness >= 40) return 'Their cup is low — a thoughtful gesture will help.';
    return 'Their cup is nearly empty. Give them extra care today.';
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <SafetyHeader showNotification={true} />

      {demoMode && (
        <div className="bg-bae-navy text-white text-xs px-4 py-2 flex items-center justify-between">
          <span>👀 Sample couple — Sam &amp; Maya, one month in</span>
          <button onClick={exitDemo} className="underline font-medium">Exit demo</button>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div variants={itemVariants} className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-bae-navy/60 text-sm">Good morning, love 💕</p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate?.('profile-edit')}
              className="p-1 hover:bg-bae-peach/30 rounded-full transition"
              title="Edit Profile"
            >
              <Edit className="w-4 h-4 text-bae-navy/60" />
            </motion.button>
          </div>
          <h2 className="text-2xl font-bold text-bae-navy mb-1">
            Let's make today a great one for {partnerName}.
          </h2>
          <p className="text-sm text-bae-navy/70">Tiny efforts. Big love.</p>
        </motion.div>

        {/* Connect your partner — top priority until paired */}
        {!isPaired && !demoMode && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <div className="flex items-start gap-3">
                <motion.span
                  className="text-3xl flex-shrink-0"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  💞
                </motion.span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-bae-navy">
                    {partnerName !== 'your person' ? `Bring ${partnerName} in` : 'Connect your partner'}
                  </h3>
                  <p className="text-xs text-bae-navy/60 mt-0.5">
                    Bae Watch is a two-player game — link up so your check-ins, love languages,
                    and insights flow between your devices.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-3"
                onClick={() => onNavigate?.('partner-invite')}
              >
                Invite or enter a code 💌
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Weekly Recap Card */}
        <AnimatePresence>
          {showRecap && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card variant="gradient">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-base font-bold text-bae-navy">💌 Your Week in Love</p>
                </div>
                {hasEnoughData ? (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-bae-coral">{weekCheckIns.length}</p>
                      <p className="text-xs text-bae-navy/60">Check-ins this week</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-bae-coral">{avgCup}%</p>
                      <p className="text-xs text-bae-navy/60">Avg cup fullness</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-bae-coral">
                        {connArrow} {connDelta !== null ? Math.abs(connDelta) : 0} pts
                      </p>
                      <p className="text-xs text-bae-navy/60">Connection</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{topMood ? moodEmojis[topMood] || '💕' : '💕'}</p>
                      <p className="text-xs text-bae-navy/60">Top mood</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-bae-navy/60 mb-4">Start checking in daily to see your weekly recap 💕</p>
                )}
                <Button
                  variant="ghost"
                  onClick={dismissWeeklyRecap}
                  className="w-full text-sm"
                >
                  See you next week 💕
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <RelationshipWeatherWidget
            connectionLevel={relationshipData.connectionLevel}
            cupFullness={cupFullness}
            mood={relationshipData.weatherMood}
          />
          <button
            onClick={() => onNavigate?.('insights')}
            className="w-full mt-2 text-center text-sm font-semibold text-bae-coral py-2 hover:bg-bae-peach/20 rounded-xl transition"
          >
            📊 View Insights & Health Score →
          </button>
        </motion.div>

        {/* Quick links — manual, timeline, growth, date nights */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
          {[
            { page: 'manual', emoji: '📖', label: 'My Manual' },
            { page: 'timeline', emoji: '📜', label: 'Timeline' },
            { page: 'growth', emoji: '🌱', label: 'Growth' },
            { page: 'date-planner', emoji: '🌙', label: 'Date Night' },
          ].map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate?.(link.page)}
              className="bg-bae-warm-white border border-bae-peach/40 rounded-2xl py-3 flex flex-col items-center gap-1 hover:bg-bae-light-peach transition"
            >
              <span className="text-xl">{link.emoji}</span>
              <span className="text-[11px] font-semibold text-bae-navy">{link.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Understanding Me — attachment & trauma self-insight */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">🪞</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-bae-navy">
                  {selfInsight?.card ? 'Your love map' : 'Understand yourself first'}
                </h3>
                <p className="text-xs text-bae-navy/60 mt-0.5">
                  {selfInsight?.card
                    ? selfInsight.card.headline
                    : 'Discover your attachment style and help your partner understand how you love.'}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full mt-3"
              onClick={() => onNavigate?.('understanding-me')}
            >
              {selfInsight?.card ? 'View my card' : 'Begin'}
            </Button>
          </Card>
        </motion.div>

        {/* Repair request — the hurt partner decides what repair looks like */}
        {repairReq && !iAmApologizer && repairReq.status === 'choosing' && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <p className="text-sm font-bold text-bae-navy mb-1">
                💙 {repairReq.fromName || partnerName} worked through the repair guide and wants to make things right.
              </p>
              <p className="text-xs text-bae-navy/60 mb-3">
                What would actually feel best to you? There's no wrong answer — and no pressure to pick anything you don't want.
              </p>
              <div className="space-y-2">
                {repairOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => chooseRepairOption(o.id)}
                    className="w-full text-left p-3 rounded-2xl border border-bae-peach/40 bg-white/70 flex items-center gap-3 hover:bg-bae-light-peach transition"
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className="text-sm text-bae-navy">{o.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {repairReq && !iAmApologizer && repairReq.status === 'chosen' && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <p className="text-sm font-bold text-bae-navy mb-1">
                💙 You asked for: {chosenOption?.emoji} {chosenOption?.label}
              </p>
              <p className="text-xs text-bae-navy/60 mb-3">
                When it genuinely feels repaired — not before — close the loop. That's what tells{' '}
                {repairReq.fromName || partnerName} the repair actually landed.
              </p>
              <Button variant="primary" size="sm" className="w-full" onClick={closeRepair}>
                It feels repaired now 💛
              </Button>
            </Card>
          </motion.div>
        )}

        {repairReq && iAmApologizer && (
          <motion.div variants={itemVariants}>
            <Card variant="light">
              {repairReq.status === 'choosing' ? (
                <>
                  <p className="text-sm font-bold text-bae-navy mb-1">💙 Repair in {partnerName}'s hands</p>
                  <p className="text-xs text-bae-navy/60">
                    You did your part. {partnerName} is being asked what would feel best — you'll see
                    their answer here. Repair completes when it feels repaired to them.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-bae-navy mb-1">
                    💙 {partnerName} chose: {chosenOption?.emoji} {chosenOption?.label}
                  </p>
                  <p className="text-xs text-bae-navy/60">
                    That's your answer — no guessing needed. Follow through, gently.
                  </p>
                </>
              )}
            </Card>
          </motion.div>
        )}

        {/* Partner's latest check-in — synced live from their device */}
        {partnerCheckIn && (
          <motion.div variants={itemVariants}>
            <Card variant="light">
              <p className="text-xs font-semibold text-bae-coral mb-2">
                💌 {partnerName.toUpperCase()} CHECKED IN
                {partnerCheckIn.date ? ` · ${partnerCheckIn.date}` : ''}
              </p>
              <p className="text-sm font-semibold text-bae-navy">
                Feeling {partnerCheckIn.moodLabel || partnerCheckIn.stateId}
              </p>
              {partnerCheckIn.note && (
                <p className="text-sm text-bae-navy/70 italic mt-1">"{partnerCheckIn.note}"</p>
              )}
              {partnerCheckIn.needs?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {partnerCheckIn.needs.map((n) => (
                    <span key={n} className="text-[11px] font-medium bg-bae-peach text-bae-navy px-2.5 py-1 rounded-full">
                      {n}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-bae-navy/50 mt-2">
                This is how to show up for {partnerName} today.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Their Manual of Me, opened to today's page — written once, calmly,
            so they never have to explain themselves mid-storm */}
        {manualHasContent && (
          <motion.div variants={itemVariants}>
            <Card variant="peach">
              <p className="text-xs font-semibold text-bae-coral mb-2">
                📖 FROM {partnerName.toUpperCase()}'S MANUAL — for days like today
              </p>
              {manualEntry.means && (
                <p className="text-sm text-bae-navy/80 mb-2">
                  <strong>What's really happening:</strong> {manualEntry.means}
                </p>
              )}
              {manualEntry.helps && (
                <p className="text-sm text-bae-navy/80">
                  <strong>What actually helps:</strong> {manualEntry.helps}
                </p>
              )}
              {partnerManual?.neverSay && (
                <p className="text-xs text-bae-navy/50 mt-2">🚫 Just don't say: "{partnerManual.neverSay}"</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Chat — with Bae one tap away */}
        <motion.div variants={itemVariants}>
          <Card variant="light" onClick={() => onNavigate?.('chat')} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">💬</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-bae-navy">Chat with {partnerName}</h3>
                <p className="text-xs text-bae-navy/60 mt-0.5">
                  Your private space — and Bae ✨ is right there when you want a wise third voice.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Growth edge — one small practice at your attachment style's edge */}
        {growthEdge && (
          <motion.div variants={itemVariants}>
            <Card variant="light">
              <p className="text-xs font-semibold text-bae-coral mb-1">
                🌱 THIS WEEK'S GROWTH EDGE {myStyle && attachmentStyles[myStyle] ? `· ${attachmentStyles[myStyle].emoji}` : ''}
              </p>
              <p className="text-sm text-bae-navy/80">{growthEdge}</p>
            </Card>
          </motion.div>
        )}

        {/* Gentle pattern noticing — detection from behaviour, not self-report */}
        {patternLabel && (
          <motion.div variants={itemVariants}>
            <Card variant="light">
              <p className="text-sm text-bae-navy/80">
                💭 I've noticed you've felt <strong>{patternLabel}</strong> a few times these past two
                weeks. No judgment — patterns are information. Want to explore it?
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onNavigate?.('understanding-me')}>
                  Reflect on it
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onNavigate?.('chat')}>
                  Talk to Bae ✨
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Connection Bridge — how two attachment styles can meet in the middle */}
        {bridge && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌉</span>
                <h3 className="text-base font-bold text-bae-navy">Your Connection Bridge</h3>
              </div>
              <p className="text-sm text-bae-navy/75 mb-3">{bridge.dynamic}</p>
              <div className="space-y-2">
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-xs font-semibold text-bae-coral mb-0.5">FOR YOU</p>
                  <p className="text-sm text-bae-navy/80">{bridge.forA}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-xs font-semibold text-bae-coral mb-0.5">
                    FOR {(profile.partnerName || 'THEM').toUpperCase()}
                  </p>
                  <p className="text-sm text-bae-navy/80">{bridge.forB}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-xs font-semibold text-bae-coral mb-0.5">TRY TOGETHER</p>
                  <p className="text-sm text-bae-navy/80">{bridge.sharedRitual}</p>
                </div>
              </div>
              <p className="text-xs text-bae-navy/60 italic mt-3">💛 {bridge.reframe}</p>
            </Card>
          </motion.div>
        )}

        {/* Love-language reminder — how to love your partner THEIR way */}
        <motion.div variants={itemVariants}>
          {llReminder ? (
            <Card variant="peach" onClick={() => onNavigate?.('love-languages')} className="cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{llReminder.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-bae-navy">{llReminder.headline}</p>
                  <p className="text-xs text-bae-navy/70 mt-1">💡 Today: {llReminder.tip}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="light">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">💞</span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-bae-navy">Speak their love language</h3>
                  <p className="text-xs text-bae-navy/60 mt-0.5">
                    Learn the 5 love languages and set how you each feel most loved.
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full mt-3" onClick={() => onNavigate?.('love-languages')}>
                Explore love languages
              </Button>
            </Card>
          )}
        </motion.div>

        {/* "Did it land?" — the receiver's one-tap confirmation that closes the
            love-language loop and teaches the giver what actually works */}
        {isPaired || demoMode ? (
          !(relationshipData.languageWins || []).includes(todayStr) ? (
            <motion.div variants={itemVariants}>
              <Card variant="light" hover={false}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">💛</span>
                  <p className="flex-1 text-sm text-bae-navy/75">
                    Did {partnerName} do something today that made you feel loved?
                  </p>
                  <Button variant="outline" size="sm" onClick={recordLanguageWin}>
                    It landed 💛
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card variant="light" hover={false}>
                <p className="text-sm text-bae-navy/70 text-center">
                  💛 You told {partnerName} today's love landed. That's the loop that keeps it coming.
                </p>
              </Card>
            </motion.div>
          )
        ) : null}

        {/* Giver's payoff: your partner confirmed your love landed */}
        {relationshipData.partnerSync?.lastLanguageWin === todayStr && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <p className="text-sm font-semibold text-bae-navy text-center">
                🎉 {partnerName} said something you did today <em>landed</em>. Whatever it was — more of that.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Repair Banner */}
        <AnimatePresence>
          {showRepairBanner && !repairDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-700">💙 Repair Mode</p>
                <p className="text-xs text-blue-600/70 mt-0.5">Let's reconnect — a guided repair toolkit awaits.</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('repair')}
                  className="text-xs font-semibold text-white bg-blue-500 rounded-xl px-3 py-1.5"
                >
                  Start
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRepairDismissed(true)}
                  className="p-1 hover:bg-blue-100 rounded-full"
                >
                  <X className="w-4 h-4 text-blue-400" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Question Card */}
        <motion.div variants={itemVariants}>
          <Card variant="light">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold text-bae-coral uppercase tracking-wide">Daily Question</p>
              {answeredToday && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Answered today
                </span>
              )}
            </div>
            <p className="text-sm text-bae-navy font-medium mb-3">{truncatedQuestion}</p>
            <Button
              variant={answeredToday ? 'ghost' : 'secondary'}
              onClick={() => onNavigate?.('daily-question')}
              className="text-sm"
            >
              {answeredToday ? 'See your answer →' : 'Answer now →'}
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="light">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-bae-navy">Partner Cup</h3>
                <p className="text-sm text-bae-navy/70">
                  How full is {partnerName}'s cup today?
                </p>
              </div>
              <span className="text-2xl font-bold text-bae-coral">{cupFullness}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-bae-peach/50 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bae-coral to-bae-salmon"
                style={{ width: `${cupFullness}%` }}
              />
            </div>
            <p className="text-sm text-bae-navy/70">{cupMessage()}</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ConnectionLevelWidget level={relationshipData.connectionLevel} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InsightCard
            title="Today's Insight"
            insight={`Your partner is currently ${profile.currentMood?.toLowerCase() || 'in a quiet mood'}.`}
            suggestion={`Try ${profile.supportPreference?.toLowerCase() || 'a supportive gesture'} today.`}
            action="Ask: What would help you feel most cared for?"
          />
        </motion.div>

        {/* Bucket List Preview */}
        <motion.div variants={itemVariants}>
          <Card variant="light">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-bae-navy">Bucket List 🌟</h3>
              <span className="text-xs text-bae-navy/50">{activeBucketItems.length} remaining</span>
            </div>
            {topBucketPreview.length > 0 ? (
              <div className="space-y-2 mb-3">
                {topBucketPreview.map((item) => (
                  <p key={item.id} className="text-sm text-bae-navy/70 truncate">• {item.title}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bae-navy/50 mb-3">No dreams yet — add your first!</p>
            )}
            <Button variant="ghost" onClick={() => onNavigate?.('bucket-list')} className="text-sm">
              See all →
            </Button>
          </Card>
        </motion.div>

        {activeCommitment && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-bae-navy/60 mb-1">📌 Your repair commitment</p>
                  <p className="text-sm font-medium text-bae-navy">"{activeCommitment.text}"</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-3"
                onClick={() => dismissRepairCommitment(activeCommitment.date)}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> I kept this promise ✓
              </Button>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card variant="peach">
            <div className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">💙</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-bae-navy">Had a disagreement?</h3>
                <p className="text-xs text-bae-navy/60 mt-0.5">
                  A guided repair process — own your part, listen fully, reconnect.
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={() => onNavigate?.('repair')} className="w-full mt-3" size="sm">
              Start Repair Guide
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="light">
            <h3 className="text-lg font-semibold text-bae-navy mb-4">
              Suggested Actions
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: Zap,
                  title: 'Quick Win',
                  description: 'Make their coffee exactly how they like it',
                },
                {
                  icon: Heart,
                  title: 'Affection',
                  description: 'Give them a caring compliment today',
                },
                {
                  icon: TrendingUp,
                  title: 'Conversation',
                  description: `Ask: How can I best fill ${partnerName}'s cup?`,
                },
              ].map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-start gap-3 p-3 bg-bae-light-peach rounded-xl hover:bg-bae-peach transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-bae-coral flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm text-bae-navy">{action.title}</p>
                      <p className="text-xs text-bae-navy/70">{action.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default HomePage;
