import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Card from '../components/common/Card';
import RelationshipWeatherWidget from '../components/widgets/RelationshipWeatherWidget';
import ConnectionLevelWidget from '../components/widgets/ConnectionLevelWidget';
import InsightCard from '../components/cards/InsightCard';
import FloatingHearts from '../components/common/FloatingHearts';
import { Heart, Zap, TrendingUp, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [signalCooldown, setSignalCooldown] = useState(false);
  const [signalSent, setSignalSent] = useState(false);

  const {
    relationshipData,
    streak,
    partnerData,
    isPartnerConnected,
    incomingSignal,
    sendBaeSignal,
    dismissSignal,
  } = useApp();

  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your person';

  // Use live partner data when connected, otherwise fall back to local estimates
  const cupFullness = isPartnerConnected && partnerData
    ? (partnerData.profile?.cupFullness ?? profile.cupFullness ?? 72)
    : (profile.cupFullness ?? 72);

  const partnerMood = isPartnerConnected && partnerData
    ? (partnerData.profile?.currentMood ?? profile.currentMood)
    : profile.currentMood;

  const partnerWeatherMood = isPartnerConnected && partnerData
    ? (partnerData.weatherMood ?? relationshipData.weatherMood)
    : relationshipData.weatherMood;

  // Auto-dismiss incoming signal after 3 seconds
  useEffect(() => {
    if (incomingSignal) {
      const timer = setTimeout(() => {
        dismissSignal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [incomingSignal, dismissSignal]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      onNavigate?.('home');
    } else if (tab === 'checkin') {
      onNavigate?.('checkin');
    } else if (tab === 'add') {
      onNavigate?.('coach');
    } else if (tab === 'memories') {
      onNavigate?.('memories');
    } else if (tab === 'games') {
      onNavigate?.('games');
    } else if (tab === 'weather') {
      onNavigate?.('weather');
    }
  };

  const handleSendSignal = async () => {
    if (signalCooldown) return;
    await sendBaeSignal();
    setSignalSent(true);
    setSignalCooldown(true);
    setTimeout(() => setSignalSent(false), 2000);
    setTimeout(() => setSignalCooldown(false), 30000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
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

      {/* Incoming Bae Signal overlay */}
      <AnimatePresence>
        {incomingSignal && (
          <motion.div
            key="signal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bae-navy/60 backdrop-blur-sm"
            onClick={dismissSignal}
          >
            <FloatingHearts count={16} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-10 bg-bae-warm-white rounded-3xl px-8 py-10 text-center shadow-2xl mx-6"
            >
              <p className="text-5xl mb-4">💕</p>
              <p className="text-2xl font-bold text-bae-navy mb-2">
                {incomingSignal.from} is thinking of you!
              </p>
              <p className="text-sm text-bae-navy/60">Tap anywhere to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        <motion.div variants={itemVariants}>
          <RelationshipWeatherWidget
            connectionLevel={relationshipData.connectionLevel}
            cupFullness={cupFullness}
            mood={partnerWeatherMood}
          />
        </motion.div>

        {/* Streak celebration card */}
        {streak && streak.current >= 3 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="light">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-bold text-bae-navy">
                    {streak.current}-day streak! You're on a roll.
                  </p>
                  <p className="text-sm text-bae-navy/60">
                    Keep showing up for your relationship.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card variant="light">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-bae-navy">Partner Cup</h3>
                  {isPartnerConnected && partnerData && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      Live
                    </span>
                  )}
                </div>
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
            insight={`Your partner is currently ${(partnerMood ?? profile.currentMood)?.toLowerCase() || 'in a quiet mood'}.`}
            suggestion={`Try ${profile.supportPreference?.toLowerCase() || 'a supportive gesture'} today.`}
            action="Ask: What would help you feel most cared for?"
          />
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
                      <p className="font-semibold text-sm text-bae-navy">
                        {action.title}
                      </p>
                      <p className="text-xs text-bae-navy/70">
                        {action.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Bae Signal button — only when partner is connected */}
        {isPartnerConnected && (
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              animate={signalSent ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
              onClick={handleSendSignal}
              disabled={signalCooldown}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all
                ${signalCooldown
                  ? 'bg-bae-peach/50 text-bae-navy/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-bae-coral to-bae-salmon text-white shadow-md hover:shadow-lg active:shadow-sm'
                }`}
            >
              <span className="text-xl">💕</span>
              {signalSent
                ? 'Signal sent!'
                : signalCooldown
                  ? 'Signal sent — wait 30s'
                  : `Send a Signal to ${partnerName}`}
            </motion.button>
          </motion.div>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default HomePage;
