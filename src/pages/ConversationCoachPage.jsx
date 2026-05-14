import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Copy, Heart, RefreshCw, Share2 } from 'lucide-react';

export const ConversationCoachPage = ({ onNavigate }) => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [copied, setCopied] = useState(false);

  const prompts = [
    {
      mood: 'Affection',
      emoji: '💕',
      title: 'Deep Connection',
      prompt: 'What\'s something I did recently that made you feel loved?',
      context: 'Best for: Morning conversations or before bed',
      tips: 'Listen fully. Don\'t interrupt. Show you care about their answer.',
    },
    {
      mood: 'Support',
      emoji: '🤗',
      title: 'What Can I Help With?',
      prompt: 'Today seems heavy for you. What\'s one thing I can take off your plate?',
      context: 'Best for: When your person is stressed or overwhelmed',
      tips: 'Be specific about what you can do. Then actually do it.',
    },
    {
      mood: 'Playfulness',
      emoji: '😊',
      title: 'Lighten The Load',
      prompt: 'What\'s something that would make you smile right now?',
      context: 'Best for: Breaking tension or lifting mood',
      tips: 'Be playful. Suggest something fun you could do together.',
    },
    {
      mood: 'Vulnerability',
      emoji: '💭',
      title: 'Let Me In',
      prompt: 'I\'ve noticed you seem distant. Can we talk about what\'s really going on?',
      context: 'Best for: Reopening communication after disconnection',
      tips: 'Be gentle. Make it safe for your person to be honest. No judgment.',
    },
    {
      mood: 'Gratitude',
      emoji: '🙏',
      title: 'Appreciation',
      prompt: 'I was thinking about how much I appreciate that you... [specific thing]. Tell me how that made you feel?',
      context: 'Best for: Building positive connection',
      tips: 'Be genuine. Specific appreciation feels more real.',
    },
  ];

  const prompt = prompts[currentPrompt];

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToNext = () => {
    setCurrentPrompt((prev) => (prev + 1) % prompts.length);
  };

  const goToPrev = () => {
    setCurrentPrompt((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mt-6"
        >
          <h2 className="text-2xl font-bold text-bae-navy mb-2">
            Conversation Coach
          </h2>
          <p className="text-sm text-bae-navy/70">
            AI-powered conversation starters that actually work
          </p>
        </motion.div>

        {/* Current Prompt Card */}
        <motion.div
          key={currentPrompt}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient">
            <div className="space-y-6">
              {/* Mood Badge */}
              <div className="flex items-center gap-3 pb-4 border-b border-bae-peach/30">
                <span className="text-4xl">{prompt.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-bae-navy/60">Topic</p>
                  <h3 className="text-lg font-bold text-bae-navy">
                    {prompt.title}
                  </h3>
                </div>
              </div>

              {/* The Prompt */}
              <div>
                <p className="text-sm font-semibold text-bae-navy/60 mb-2">
                  Opening Line
                </p>
                <p className="text-lg font-semibold text-bae-navy leading-relaxed mb-4">
                  "{prompt.prompt}"
                </p>

                {/* Copy Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bae-light-peach rounded-xl hover:bg-bae-peach transition-colors text-bae-coral font-semibold text-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied to clipboard!' : 'Copy Prompt'}
                </motion.button>
              </div>

              {/* Context */}
              <div className="bg-white/50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-bae-navy/60 mb-1">
                    {prompt.context}
                  </p>
                </div>
                <div className="border-t border-bae-peach/30 pt-3">
                  <p className="text-xs font-semibold text-bae-coral mb-1">
                    💡 Pro Tip
                  </p>
                  <p className="text-sm text-bae-navy/70">{prompt.tips}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-2 items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrev}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bae-light-peach rounded-xl hover:bg-bae-peach transition-colors text-bae-navy font-semibold"
          >
            ← Previous
          </motion.button>

          <div className="flex gap-1">
            {prompts.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentPrompt(idx)}
                animate={{
                  backgroundColor: currentPrompt === idx ? '#FF6B5B' : '#FFE5D0',
                }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNext}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bae-light-peach rounded-xl hover:bg-bae-peach transition-colors text-bae-navy font-semibold"
          >
            Next →
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" className="w-full" size="lg">
            <Heart className="w-5 h-5 inline mr-2" />
            Use This Prompt
          </Button>
          <Button variant="secondary" className="w-full" size="md">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            More Like This
          </Button>
        </div>

        {/* Why This Works */}
        <Card variant="light">
          <h4 className="font-semibold text-bae-navy mb-3 flex items-center gap-2">
            🎯 Why This Works
          </h4>
          <ul className="space-y-2 text-sm text-bae-navy/70">
            <li className="flex gap-2">
              <span>✓</span>
              <span>
                <strong>Specific enough</strong> to avoid generic small talk
              </span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>
                <strong>Open-ended</strong> so your person can share deeply
              </span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>
                <strong>Safe to answer</strong> without judgment
              </span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>
                <strong>Emotionally attuned</strong> to what your person needs
              </span>
            </li>
          </ul>
        </Card>

        {/* Info */}
        <Card variant="peach">
          <p className="text-sm text-bae-navy/70 flex gap-2">
            <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
            <span>
              These prompts are generated by understanding your partner's emotional needs,
              recent patterns, and what has worked in the past. Each one is
              designed to deepen your connection.
            </span>
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="add" onTabChange={(tab) => {
        if (tab === 'home') onNavigate?.('home');
        else if (tab === 'checkin') onNavigate?.('checkin');
        else if (tab === 'add') onNavigate?.('coach');
        else if (tab === 'memories') onNavigate?.('memories');
        else if (tab === 'games') onNavigate?.('games');
        else if (tab === 'weather') onNavigate?.('weather');
      }} />
    </motion.div>
  );
};

export default ConversationCoachPage;
