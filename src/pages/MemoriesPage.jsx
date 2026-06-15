import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Heart, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const categoryOptions = [
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
  { id: 'comfort', label: 'Comfort', emoji: '🥰' },
  { id: 'important', label: 'Important', emoji: '📌' },
  { id: 'dislikes', label: 'Sensory/Dislikes', emoji: '🚫' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'stressRelief', label: 'Stress Relief', emoji: '🎵' },
];

const categoryEmoji = Object.fromEntries(categoryOptions.map((c) => [c.id, c.emoji]));

const filterTabs = [{ id: 'all', label: 'All', emoji: '📝' }, ...categoryOptions];

export const MemoriesPage = ({ onNavigate }) => {
  const { relationshipData, addMemory, deleteMemory } = useApp();
  const memories = relationshipData.memories || [];

  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: 'favorites', title: '', value: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAddMemory = () => {
    if (!formData.title.trim() || !formData.value.trim()) return;
    addMemory({
      category: formData.category,
      emoji: categoryEmoji[formData.category] || '💭',
      title: formData.title.trim(),
      value: formData.value.trim(),
    });
    setFormData({ category: 'favorites', title: '', value: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    deleteMemory(id);
    setConfirmDelete(null);
  };

  const filtered = activeFilter === 'all' ? memories : memories.filter((m) => m.category === activeFilter);

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
          <h2 className="text-2xl font-bold text-bae-navy mb-2">Relationship Memory</h2>
          <p className="text-sm text-bae-navy/70">Remember what matters. Show you care.</p>
        </motion.div>

        {/* Add button */}
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

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <Card variant="peach">
                <h3 className="text-lg font-semibold text-bae-navy mb-4">Add to Memory</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Favorite Movie"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-bae-navy/60 mb-2 block">Details</label>
                    <textarea
                      placeholder="e.g., Pride and Prejudice (the BBC one, not the recent movie)"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral resize-none"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleAddMemory}
                      disabled={!formData.title.trim() || !formData.value.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter tabs */}
        {memories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-bae-coral text-white'
                    : 'bg-bae-light-peach text-bae-navy hover:bg-bae-peach'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Memories list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-4xl mb-3">🧠</p>
            <p className="text-bae-navy font-semibold mb-1">No memories yet</p>
            <p className="text-sm text-bae-navy/60">
              {activeFilter === 'all'
                ? "Tap 'Add to Memory' to start building your partner's profile."
                : 'No memories in this category yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {filtered.map((memory, idx) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card variant="light">
                  <div className="flex gap-4 items-start">
                    <div className="text-3xl flex-shrink-0">{memory.emoji || '💭'}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-bae-navy text-sm mb-1">{memory.title}</h4>
                      <p className="text-sm text-bae-navy/70 leading-snug">{memory.value}</p>
                    </div>
                    {confirmDelete === memory.id ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(memory.id)}
                          className="text-xs text-red-500 font-semibold"
                        >
                          Delete
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-bae-navy/50"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDelete(memory.id)}
                        className="text-bae-navy/30 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Card variant="gradient">
          <h4 className="font-semibold text-bae-navy mb-3 flex items-center gap-2">
            💡 Use These Memories To...
          </h4>
          <ul className="space-y-2 text-sm text-bae-navy/70">
            <li className="flex gap-2"><span>✓</span><span>Personalize your gestures and compliments</span></li>
            <li className="flex gap-2"><span>✓</span><span>Avoid things that stress your person out</span></li>
            <li className="flex gap-2"><span>✓</span><span>Plan surprises they'll actually love</span></li>
            <li className="flex gap-2"><span>✓</span><span>Understand your partner without asking every time</span></li>
          </ul>
        </Card>

        <Card variant="light">
          <p className="text-xs text-bae-navy/60 flex gap-2">
            <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
            <span>
              These memories are saved to your account and help personalize your relationship insights.
            </span>
          </p>
        </Card>
      </div>

      <BottomNavigation activeTab="memories" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default MemoriesPage;
