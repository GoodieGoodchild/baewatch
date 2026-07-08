import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Copy, Heart, RefreshCw, Check } from 'lucide-react';
import { promptCategories, categoryLabels } from '../services/promptService';
import { useApp } from '../context/AppContext';

const categoryKeys = Object.keys(promptCategories);

export const ConversationCoachPage = ({ onNavigate }) => {
  const { relationshipData, addWin } = useApp();
  const profile = relationshipData.profile || {};

  const [activeCategory, setActiveCategory] = useState('connection');
  const [promptIndex, setPromptIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(false);

  const prompts = promptCategories[activeCategory] || promptCategories.connection;
  const prompt = prompts[promptIndex % prompts.length];

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    addWin({ title: 'Used a conversation prompt', prompt: prompt.title });
    setUsed(true);
    setTimeout(() => setUsed(false), 2000);
  };

  const handleMoreLikeThis = () => {
    setPromptIndex((prev) => (prev + 1) % prompts.length);
    setUsed(false);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPromptIndex(0);
    setUsed(false);
  };

  const goToNext = () => {
    setPromptIndex((prev) => (prev + 1) % prompts.length);
    setUsed(false);
  };

  const goToPrev = () => {
    setPromptIndex((prev) => (prev - 1 + prompts.length) % prompts.length);
    setUsed(false);
  };

  const handleTabChange = (tab) => {
    const map = { home: 'home', checkin: 'checkin', add: 'coach', memories: 'memories', games: 'games', weather: 'weather' };
    if (map[tab]) onNavigate?.(map[tab]);
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
          <h2 className="text-2xl font-bold text-bae-navy mb-2">Conversation Coach</h2>
          <p className="text-sm text-bae-navy/70">
            Prompts tailored to what {profile.partnerName || 'your person'} needs right now.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2">
          {categoryKeys.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-bae-coral text-white shadow'
                  : 'bg-bae-light-peach text-bae-navy hover:bg-bae-peach'
              }`}
            >
              {categoryLabels[cat]}
            </motion.button>
          ))}
        </div>

        {/* Prompt card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${promptIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card variant="gradient">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-bae-peach/30">
                  <span className="text-4xl">{prompt.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-bae-navy/60">
                      {categoryLabels[activeCategory]}
                    </p>
                    <h3 className="text-lg font-bold text-bae-navy">{prompt.title}</h3>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-bae-navy/60 mb-2">Opening Line</p>
                  <p className="text-lg font-semibold text-bae-navy leading-relaxed mb-4">
                    "{prompt.prompt}"
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bae-light-peach rounded-xl hover:bg-bae-peach transition-colors text-bae-coral font-semibold text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </motion.button>
                </div>

                <div className="bg-white/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-bae-navy/60">{prompt.context}</p>
                  <div className="border-t border-bae-peach/30 pt-3">
                    <p className="text-xs font-semibold text-bae-coral mb-1">💡 Why This Works</p>
                    <p className="text-sm text-bae-navy/70">{prompt.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Prev / dots / next */}
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
                onClick={() => { setPromptIndex(idx); setUsed(false); }}
                animate={{ backgroundColor: promptIndex % prompts.length === idx ? '#FF6B5B' : '#FFE5D0' }}
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

        {/* Action buttons */}
        <div className="space-y-3">
          <Button variant="primary" className="w-full" size="lg" onClick={handleUse}>
            <Heart className="w-5 h-5 inline mr-2" />
            {used ? 'Logged as a win! 🎉' : 'I Used This Prompt'}
          </Button>
          <Button variant="secondary" className="w-full" size="md" onClick={handleMoreLikeThis}>
            <RefreshCw className="w-4 h-4 inline mr-2" />
            More Like This
          </Button>
        </div>
      </div>

      <BottomNavigation activeTab="add" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default ConversationCoachPage;
