import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import {
  analyzePatterns,
  calculateHealthScore,
  connectionTrend,
} from '../services/insightEngine';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function scoreLabel(score) {
  if (score >= 80) return 'Thriving';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Growing';
  return 'Needs attention';
}

function scoreColor(score) {
  if (score >= 80) return '#f4845f'; // bae-coral
  if (score >= 60) return '#22c55e'; // green-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function HealthScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f5e6d8" strokeWidth="10" />
          {/* Animated score circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-bae-navy/60 font-medium">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-bae-navy">{scoreLabel(score)}</p>
        <p className="text-xs text-bae-navy/60 mt-1">Based on your check-in history and connection trends</p>
      </div>
    </div>
  );
}

function ConnectionBarChart({ connectionLevelHistory }) {
  const last14 = connectionLevelHistory.slice(-14);

  if (last14.length === 0) {
    return (
      <p className="text-sm text-bae-navy/60 text-center py-4">No connection history yet.</p>
    );
  }

  const maxVal = Math.max(...last14.map((e) => e.value), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {last14.map((entry, i) => {
        const heightPct = (entry.value / 100) * 100;
        const isAbove70 = entry.value >= 70;
        const date = new Date(entry.date);
        const dayLabel = DAY_SHORT[date.getDay()];
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className={`w-full rounded-t-sm ${isAbove70 ? 'bg-bae-coral' : 'bg-bae-peach'}`}
              style={{ height: `${heightPct}%`, minHeight: 4 }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
            />
            <span className="text-[9px] text-bae-navy/50 leading-none">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function EmotionalStateSummary({ checkInHistory }) {
  const last14 = checkInHistory.slice(-14);
  const counts = {};
  for (const entry of last14) {
    if (entry.stateId) {
      counts[entry.stateId] = (counts[entry.stateId] || 0) + 1;
    }
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="text-sm text-bae-navy/60">No data yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([stateId, count]) => (
        <span
          key={stateId}
          className="px-3 py-1 bg-bae-light-peach rounded-full text-sm text-bae-navy font-medium"
        >
          {stateId} <span className="text-bae-coral font-bold">×{count}</span>
        </span>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const InsightsPage = ({ onNavigate }) => {
  const { relationshipData } = useApp();
  const { checkInHistory = [], connectionLevelHistory = [], profile = {}, connectionLevel = 72 } = relationshipData;

  const healthScore = useMemo(() =>
    calculateHealthScore({
      checkInHistory,
      connectionLevelHistory,
      currentConnectionLevel: connectionLevel,
      currentCupFullness: profile.cupFullness ?? 72,
    }),
    [checkInHistory, connectionLevelHistory, connectionLevel, profile.cupFullness]
  );

  const insights = useMemo(() =>
    analyzePatterns(checkInHistory, connectionLevelHistory),
    [checkInHistory, connectionLevelHistory]
  );

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'games') onNavigate?.('games');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  const hasEnoughData = checkInHistory.length >= 3;

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div variants={itemVariants} className="text-center mt-4">
          <h2 className="text-2xl font-bold text-bae-navy">Relationship Insights</h2>
          <p className="text-sm text-bae-navy/60 mt-1">Patterns, health score &amp; what's working</p>
        </motion.div>

        {!hasEnoughData ? (
          <motion.div variants={itemVariants}>
            <Card variant="peach">
              <div className="text-center py-6">
                <p className="text-4xl mb-3">💕</p>
                <p className="text-bae-navy font-semibold text-lg mb-2">Almost there!</p>
                <p className="text-bae-navy/70 text-sm">
                  Complete a few check-ins to unlock your relationship insights 💕
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Health Score */}
            <motion.div variants={itemVariants}>
              <Card variant="gradient">
                <HealthScoreCircle score={healthScore} />
              </Card>
            </motion.div>

            {/* Connection trend chart */}
            <motion.div variants={itemVariants}>
              <Card variant="light">
                <h3 className="text-base font-semibold text-bae-navy mb-3">Connection Trend</h3>
                <ConnectionBarChart connectionLevelHistory={connectionLevelHistory} />
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-bae-navy/60">
                    <span className="w-3 h-3 rounded-sm bg-bae-coral inline-block" /> Above 70
                  </span>
                  <span className="flex items-center gap-1 text-xs text-bae-navy/60">
                    <span className="w-3 h-3 rounded-sm bg-bae-peach inline-block" /> Below 70
                  </span>
                </div>
              </Card>
            </motion.div>

            {/* Pattern Insights */}
            {insights.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-base font-semibold text-bae-navy mb-2 px-1">Pattern Insights</h3>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      custom={i}
                    >
                      <Card variant="light">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
                          <p className="text-sm text-bae-navy/80 leading-relaxed">{insight.message}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Emotional States Summary */}
            <motion.div variants={itemVariants}>
              <Card variant="light">
                <h3 className="text-base font-semibold text-bae-navy mb-3">Recent Emotional States</h3>
                <EmotionalStateSummary checkInHistory={checkInHistory} />
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <BottomNavigation activeTab="home" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default InsightsPage;
