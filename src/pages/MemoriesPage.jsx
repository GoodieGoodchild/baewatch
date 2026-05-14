import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Coffee, Heart, Calendar, Star, MapPin, Music, Utensils } from 'lucide-react';

export const MemoriesPage = ({ onNavigate }) => {
  const [memories, setMemories] = useState([
    {
      id: 1,
      category: 'favorites',
      icon: Coffee,
      title: 'Coffee Order',
      value: 'Oat milk latte, extra shot, no foam',
      emoji: '☕',
    },
    {
      id: 2,
      category: 'comfort',
      icon: Heart,
      title: 'Love Language',
      value: 'Acts of service + physical touch',
      emoji: '💕',
    },
    {
      id: 3,
      category: 'stressRelief',
      icon: Music,
      title: 'Destress Method',
      value: 'Listening to music, bubble bath, quiet time',
      emoji: '🎵',
    },
    {
      id: 4,
      category: 'important',
      icon: Calendar,
      title: 'Important Date',
      value: 'Birthday: June 15 | Anniversary: March 22',
      emoji: '📅',
    },
    {
      id: 5,
      category: 'dislikes',
      icon: MapPin,
      title: 'Sensory Dislikes',
      value: 'Loud crowds, unexpected changes, being rushed',
      emoji: '🚫',
    },
    {
      id: 6,
      category: 'food',
      icon: Utensils,
      title: 'Favorite Meal',
      value: 'Pasta with fresh pesto, garlic bread, wine',
      emoji: '🍝',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'favorites',
    title: '',
    value: '',
  });

  const categories = [
    { id: 'all', label: 'All', emoji: '📝' },
    { id: 'favorites', label: 'Favorites', emoji: '⭐' },
    { id: 'comfort', label: 'Comfort', emoji: '🥰' },
    { id: 'important', label: 'Important', emoji: '📌' },
    { id: 'dislikes', label: 'Sensory', emoji: '🚫' },
  ];

  const handleAddMemory = () => {
    if (formData.title && formData.value) {
      setMemories([
        ...memories,
        {
          id: memories.length + 1,
          category: formData.category,
          title: formData.title,
          value: formData.value,
        },
      ]);
      setFormData({ category: 'favorites', title: '', value: '' });
      setShowForm(false);
    }
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
            Relationship Memory
          </h2>
          <p className="text-sm text-bae-navy/70">
            Remember what matters. Show you care.
          </p>
        </motion.div>

        {/* Add Memory Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="peach">
              <h3 className="text-lg font-semibold text-bae-navy mb-4">
                Add to Memory
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  >
                    <option value="favorites">Favorites</option>
                    <option value="comfort">Comfort</option>
                    <option value="important">Important</option>
                    <option value="dislikes">Sensory/Dislikes</option>
                    <option value="food">Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Favorite Movie"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">
                    Details
                  </label>
                  <textarea
                    placeholder="e.g., Pride and Prejudice (the BBC one, not the recent movie)"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleAddMemory}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Add Memory Button */}
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bae-coral text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add to Memory
          </motion.button>
        )}

        {/* Memories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {memories.map((memory, idx) => {
            const Icon = memory.icon || Star;
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card variant="light" className="cursor-pointer hover:shadow-lg">
                  <div className="flex gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {memory.emoji || '💭'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-bae-navy text-sm mb-1">
                        {memory.title}
                      </h4>
                      <p className="text-sm text-bae-navy/70 leading-snug">
                        {memory.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tips */}
        <Card variant="gradient">
          <h4 className="font-semibold text-bae-navy mb-3 flex items-center gap-2">
            💡 Use These Memories To...
          </h4>
          <ul className="space-y-2 text-sm text-bae-navy/70">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Personalize your gestures and compliments</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Avoid things that stress your person out</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Plan surprises they'll actually love</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Understand your partner without asking every time</span>
            </li>
          </ul>
        </Card>

        {/* Privacy Note */}
        <Card variant="light">
          <p className="text-xs text-bae-navy/60 flex gap-2">
            <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
            <span>
              This is private to you. It stays on your device. You'll see these
              memories when planning how to support your person.
            </span>
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="insights" onTabChange={(tab) => {
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

export default MemoriesPage;
