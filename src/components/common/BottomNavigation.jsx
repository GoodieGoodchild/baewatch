import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, TrendingUp, Calendar, User, Plus, Gamepad2, Cloud } from 'lucide-react';

export const BottomNavigation = ({ activeTab = 'home', onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'checkin', label: 'Check-in', icon: MessageCircle },
    { id: 'add', label: 'Add', icon: Plus, special: true },
    { id: 'memories', label: 'Memories', icon: Calendar },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'weather', label: 'Weather', icon: Cloud },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-bae-warm-white border-t border-bae-peach/30 px-4 py-3 flex items-center justify-around"
      style={{ maxWidth: '430px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${
              isActive ? 'text-bae-coral' : 'text-bae-navy/60'
            } ${
              tab.special
                ? 'absolute -top-8 p-4 bg-bae-coral text-white rounded-full shadow-xl hover:shadow-heart'
                : ''
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                tab.special ? 'w-6 h-6' : ''
              }`}
            />
            {!tab.special && (
              <span className="text-xs font-medium">{tab.label}</span>
            )}
            {isActive && !tab.special && (
              <motion.div
                layoutId="active-indicator"
                className="absolute bottom-0 h-1 bg-bae-coral rounded-full"
                style={{ width: '40px' }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

export default BottomNavigation;
