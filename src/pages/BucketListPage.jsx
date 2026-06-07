import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ArrowLeft, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';

const categories = [
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'experiences', label: 'Experiences', emoji: '🎉' },
  { id: 'home', label: 'Home', emoji: '🏡' },
  { id: 'growth', label: 'Growth', emoji: '🌱' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
];

const getCategoryEmoji = (id) => categories.find((c) => c.id === id)?.emoji || '⭐';

const FloatingHearts = ({ onDone }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {['💕', '💖', '✨'].map((heart, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          initial={{ opacity: 1, y: 0, x: (i - 1) * 30 }}
          animate={{ opacity: 0, y: -120, x: (i - 1) * 40 }}
          transition={{ duration: 1.2, delay: i * 0.1 }}
          onAnimationComplete={i === 2 ? onDone : undefined}
        >
          {heart}
        </motion.span>
      ))}
    </div>
  );
};

export const BucketListPage = ({ onNavigate }) => {
  const { relationshipData, addBucketItem, toggleBucketItem, deleteBucketItem } = useApp();
  const bucketList = relationshipData.bucketList || [];

  const [filter, setFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('experiences');
  const [completingId, setCompletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = bucketList.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addBucketItem({ title: newTitle.trim(), category: newCategory });
    setNewTitle('');
    setNewCategory('experiences');
    setShowForm(false);
  };

  const handleToggle = (id, wasCompleted) => {
    toggleBucketItem(id);
    if (!wasCompleted) {
      setCompletingId(id);
    }
  };

  const handleDelete = (id) => {
    if (confirmDeleteId === id) {
      deleteBucketItem(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const filterTabs = ['all', 'active', 'completed'];

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-12 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      {completingId && (
        <FloatingHearts onDone={() => setCompletingId(null)} />
      )}

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate?.('home')}
            className="p-2 hover:bg-bae-peach/30 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-bae-navy">Our Bucket List 🌟</h2>
            <p className="text-xs text-bae-navy/60">{bucketList.filter((i) => !i.completed).length} dreams remaining</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm((v) => !v)}
            className="p-2 bg-bae-coral text-white rounded-full shadow"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card variant="peach">
                <p className="text-sm font-semibold text-bae-navy mb-3">Add a dream</p>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. See the Northern Lights together"
                  className="w-full rounded-xl border border-bae-peach/40 bg-white p-3 text-sm text-bae-navy placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral/30 mb-3"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-bae-peach/40 bg-white p-3 text-sm text-bae-navy mb-3 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleAdd} className="flex-1">Add</Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                filter === tab
                  ? 'bg-bae-coral text-white shadow'
                  : 'bg-bae-warm-white text-bae-navy/60 border border-bae-peach/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-4xl mb-3">🌟</p>
                <p className="text-bae-navy/60 text-sm">Dream big together 🌟<br />Add your first bucket list item</p>
              </motion.div>
            ) : (
              filtered.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  layout
                  className={`rounded-2xl p-4 border flex items-start gap-3 ${
                    item.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-bae-warm-white border-bae-peach/30'
                  }`}
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {item.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      </motion.div>
                    ) : (
                      <Square className="w-5 h-5 text-bae-navy/40" />
                    )}
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{getCategoryEmoji(item.category)}</span>
                      <p className={`text-sm font-medium text-bae-navy ${item.completed ? 'line-through text-bae-navy/50' : ''}`}>
                        {item.title}
                      </p>
                    </div>
                    {item.completed && item.completedAt && (
                      <p className="text-xs text-green-600">
                        Completed {new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleDelete(item.id)}
                    className={`flex-shrink-0 p-1.5 rounded-full transition ${
                      confirmDeleteId === item.id
                        ? 'bg-red-100 text-red-500'
                        : 'hover:bg-bae-peach/30 text-bae-navy/40'
                    }`}
                    title={confirmDeleteId === item.id ? 'Tap again to confirm' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default BucketListPage;
