import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

export const ConnectionLevelWidget = ({ level = 72 }) => {
  const getConnectionMessage = (level) => {
    if (level >= 80) return 'Strong connection! Keep it up. 💪';
    if (level >= 60) return 'Keep showing up. You\'re doing great.';
    if (level >= 40) return 'Your person would appreciate a thoughtful check-in.';
    return 'Reach out gently and make some calm space together.';
  };

  const getColor = (level) => {
    if (level >= 80) return 'from-green-200 to-emerald-300';
    if (level >= 60) return 'from-yellow-200 to-orange-300';
    if (level >= 40) return 'from-orange-300 to-red-300';
    return 'from-red-300 to-pink-400';
  };

  return (
    <Card variant="light">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-bae-navy">Connection Level</h3>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-2xl font-bold text-bae-coral"
          >
            {level}%
          </motion.span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke="#FFE5D0"
              strokeWidth="8"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={`${(level / 100) * 345} 345`}
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 345' }}
              animate={{ strokeDasharray: `${(level / 100) * 345} 345` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B5B" />
                <stop offset="100%" stopColor="#E63946" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-bae-coral">{level}%</div>
              <div className="text-xs text-bae-navy/60 mt-1">Connected</div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-gradient-to-r ${getColor(level)} p-4 rounded-2xl text-white text-center font-semibold text-sm`}
      >
        {getConnectionMessage(level)}
      </motion.div>
    </Card>
  );
};

export default ConnectionLevelWidget;
