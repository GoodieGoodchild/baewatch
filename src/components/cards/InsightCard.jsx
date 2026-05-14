import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Heart } from 'lucide-react';
import Card from '../common/Card';

export const InsightCard = ({ 
  title = "Today's Insight",
  insight = "Your person is feeling overwhelmed this week.",
  suggestion = "Practical help > Deep talks right now.",
  action = "Try: Handle the school drop-off & dinner.",
  icon: Icon = Lightbulb,
}) => {
  return (
    <Card variant="peach">
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex-shrink-0"
        >
          <Icon className="w-8 h-8 text-bae-coral" />
        </motion.div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-bae-navy/60 mb-2">
            {title}
          </h3>
          <p className="text-base font-semibold text-bae-navy mb-3">
            {insight}
          </p>

          <div className="space-y-2 bg-white/50 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-bae-coral">Priority:</span>
              <span className="text-sm text-bae-navy/70">{suggestion}</span>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
              <span className="text-sm text-bae-navy/70">{action}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ x: 4 }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-bae-coral hover:text-bae-deep-coral"
          >
            Get more prompts
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
