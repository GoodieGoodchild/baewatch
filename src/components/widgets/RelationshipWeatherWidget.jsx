import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import Card from '../common/Card';

export const RelationshipWeatherWidget = ({ mood, connectionLevel = 72, cupFullness = 72 }) => {
  const weatherTypes = {
    sunny: {
      icon: Sun,
      label: 'Sunny & Warm',
      color: 'text-yellow-400',
      description: 'Connection is strong',
      bgClass: 'from-yellow-50 to-orange-50',
    },
    cloudy: {
      icon: Cloud,
      label: 'Cloudy, But Improving',
      color: 'text-gray-400',
      description: 'Opportunity to reconnect',
      bgClass: 'from-gray-50 to-slate-50',
    },
    rainy: {
      icon: CloudRain,
      label: 'Stormy',
      color: 'text-blue-400',
      description: 'Tension detected - repair mode',
      bgClass: 'from-blue-50 to-cyan-50',
    },
    windy: {
      icon: Wind,
      label: 'Windy',
      color: 'text-teal-400',
      description: 'Change in the air',
      bgClass: 'from-teal-50 to-green-50',
    },
  };

  const computeMood = () => {
    if (mood) return mood;
    if (cupFullness < 40 || connectionLevel < 50) return 'rainy';
    if (cupFullness < 65 || connectionLevel < 65) return 'cloudy';
    if (cupFullness < 85 || connectionLevel < 80) return 'windy';
    return 'sunny';
  };

  const activeMood = computeMood();
  const weather = weatherTypes[activeMood] || weatherTypes.cloudy;
  const Icon = weather.icon;

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${weather.bgClass} p-6 rounded-2xl`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-bae-navy/60 mb-1">Relationship Weather</p>
            <h3 className="text-2xl font-bold text-bae-navy mb-2">
              {weather.label}
            </h3>
            <p className="text-sm text-bae-navy/70">{weather.description}</p>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Icon className={`w-12 h-12 ${weather.color}`} />
          </motion.div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-6 pt-4 border-t border-bae-peach/30">
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-bae-navy/50">Connection Level</p>
            <p className="mt-2 text-lg font-semibold text-bae-navy">{connectionLevel}%</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-bae-navy/50">Cup Fullness</p>
            <p className="mt-2 text-lg font-semibold text-bae-navy">{cupFullness}%</p>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

export default RelationshipWeatherWidget;
