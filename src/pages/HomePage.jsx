import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import RelationshipWeatherWidget from '../components/widgets/RelationshipWeatherWidget';
import ConnectionLevelWidget from '../components/widgets/ConnectionLevelWidget';
import InsightCard from '../components/cards/InsightCard';
import { Heart, Zap, TrendingUp, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { relationshipData } = useApp();
  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your person';
  const cupFullness = profile.cupFullness ?? 72;

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
            Let’s make today a great one for {partnerName}.
          </h2>
          <p className="text-sm text-bae-navy/70">Tiny efforts. Big love.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <RelationshipWeatherWidget
            connectionLevel={relationshipData.connectionLevel}
            cupFullness={cupFullness}
            mood={relationshipData.weatherMood}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="light">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-bae-navy">Partner Cup</h3>
                <p className="text-sm text-bae-navy/70">
                  How full is {partnerName}’s cup today?
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
                  description: `Ask: How can I best fill ${partnerName}’s cup?`,
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
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default HomePage;
