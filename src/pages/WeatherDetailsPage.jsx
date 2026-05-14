import React from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Card from '../components/common/Card';
import { Cloud, Sun, CloudRain, Wind, Heart, Brain, Battery, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WeatherDetailsPage = ({ onNavigate }) => {
  const { relationshipData } = useApp();
  const profile = relationshipData.profile || {};

  const moodStatus = {
    'A bit drained': 'rainy',
    'Open to connection': 'cloudy',
    'Feeling calm': 'sunny',
    'Needs connection': 'cloudy',
  };

  const supportStatus = {
    'Quality time': 'sunny',
    'Acts of service': 'sunny',
    'Words of affirmation': 'cloudy',
    'Physical touch': 'sunny',
  };

  const fullnessStatus = (value) => {
    if (value >= 80) return 'sunny';
    if (value >= 60) return 'cloudy';
    if (value >= 40) return 'windy';
    return 'rainy';
  };

  const weatherCharacteristics = [
    {
      category: 'Emotional Needs',
      icon: Heart,
      color: 'from-pink-200 to-rose-200',
      items: [
        {
          trait: 'Primary need',
          value: profile.partnerNeed || 'Emotional support',
          status: moodStatus[profile.partnerNeed] || 'cloudy',
        },
        {
          trait: 'Support preference',
          value: profile.supportPreference || 'Quality time',
          status: supportStatus[profile.supportPreference] || 'cloudy',
        },
        {
          trait: 'Current mood',
          value: profile.currentMood || 'Needs connection',
          status: moodStatus[profile.currentMood] || 'cloudy',
        },
        {
          trait: 'Love Language',
          value: profile.supportPreference || 'Quality time',
          status: supportStatus[profile.supportPreference] || 'cloudy',
        },
      ],
    },
    {
      category: 'Mental Patterns',
      icon: Brain,
      color: 'from-blue-200 to-cyan-200',
      items: [
        {
          trait: 'Communication rhythm',
          value: profile.partnerNeed === 'Clear communication' ? 'Direct and open' : 'Balanced',
          status: profile.partnerNeed === 'Clear communication' ? 'sunny' : 'cloudy',
        },
        {
          trait: 'Stress rhythm',
          value: profile.currentMood === 'A bit drained' ? 'Slower processing' : 'Stable',
          status: profile.currentMood === 'A bit drained' ? 'rainy' : 'sunny',
        },
        {
          trait: 'Decision style',
          value: 'Thoughtful and aware',
          status: 'sunny',
        },
        {
          trait: 'Curiosity level',
          value: 'Open to learning each other',
          status: 'sunny',
        },
      ],
    },
    {
      category: 'Energy Dynamics',
      icon: Battery,
      color: 'from-yellow-200 to-orange-200',
      items: [
        {
          trait: 'Cup fullness',
          value: `${profile.cupFullness ?? 72}% full`,
          status: fullnessStatus(profile.cupFullness ?? 72),
        },
        {
          trait: 'Support readiness',
          value: profile.currentMood === 'Feeling calm' ? 'Ready to connect' : 'Needs space',
          status: profile.currentMood === 'Feeling calm' ? 'sunny' : 'cloudy',
        },
        {
          trait: 'Recharge style',
          value: 'Quality time and quiet moments',
          status: 'cloudy',
        },
        {
          trait: 'Care signal',
          value: 'Notice small mood shifts',
          status: 'windy',
        },
      ],
    },
    {
      category: 'Relationship Style',
      icon: Users,
      color: 'from-purple-200 to-indigo-200',
      items: [
        {
          trait: 'Conversation tone',
          value: profile.supportPreference || 'Quality time',
          status: supportStatus[profile.supportPreference] || 'cloudy',
        },
        {
          trait: 'Conflict preference',
          value: 'Gentle curiosity before judgment',
          status: 'cloudy',
        },
        {
          trait: 'Trust focus',
          value: 'Consistency and presence',
          status: 'sunny',
        },
        {
          trait: 'Partner insight',
          value: profile.partnerNotes || 'Ask and reflect regularly',
          status: 'cloudy',
        },
      ],
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'windy': return <Wind className="w-4 h-4 text-gray-400" />;
      default: return <Cloud className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'insights') onNavigate?.('memories');
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mt-6"
        >
          <h2 className="text-2xl font-bold text-bae-navy mb-2">
            Relationship Weather Details
          </h2>
          <p className="text-sm text-bae-navy/70">
            Understanding your partner's needs and patterns
          </p>
        </motion.div>

        <div className="space-y-6">
          {weatherCharacteristics.map((category, categoryIdx) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIdx * 0.1 }}
              >
                <Card variant="gradient">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-bae-navy">
                      {category.category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item, itemIdx) => (
                      <motion.div
                        key={item.trait}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (categoryIdx * 0.1) + (itemIdx * 0.05) }}
                        className="flex items-start gap-3 p-3 bg-white/50 rounded-xl"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-bae-navy">
                            {item.trait}
                          </p>
                          <p className="text-xs text-bae-navy/70">
                            {item.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card variant="light">
          <div className="text-center space-y-3">
            <Heart className="w-8 h-8 text-bae-coral mx-auto" />
            <p className="text-sm text-bae-navy/70">
              These insights are built from your shared history and help you anticipate each other's needs. They evolve as you learn more about each other.
            </p>
          </div>
        </Card>
      </div>

      <BottomNavigation activeTab="weather" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default WeatherDetailsPage;