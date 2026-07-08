import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📝' },
  { id: 'milestone', label: 'Milestones', emoji: '🌅' },
  { id: 'gesture', label: 'Gestures', emoji: '💌' },
  { id: 'repair', label: 'Repair wins', emoji: '🤝' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
  { id: 'important', label: 'Important', emoji: '📌' },
];

const CATEGORY_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]));

export const MemoriesPage = ({ onNavigate }) => {
  const { relationshipData, addMemory, deleteMemory } = useApp();
  const memories = relationshipData.memories || [];
  const partnerName = relationshipData.profile?.partnerName || 'your partner';

  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ category: 'milestone', title: '', value: '' });

  const filtered = filter === 'all' ? memories : memories.filter((m) => m.category === filter);

  const handleAdd = () => {
    if (!form.title.trim() || !form.value.trim()) return;
    addMemory({
      id: Date.now(),
      category: form.category,
      title: form.title.trim(),
      value: form.value.trim(),
      emoji: CATEGORY_EMOJI[form.category] || '💭',
      date: new Date().toISOString().slice(0, 10),
    });
    setForm({ category: 'milestone', title: '', value: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deleteMemory(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 2500);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'games') onNavigate?.('games');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  return (
    <motion.div className="min-h-screen bg-bae-cream pb-32 pt-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mt-6">
          <h2 className="text-2xl font-bold text-bae-navy mb-2">Your Story Together</h2>
          <p className="text-sm text-bae-navy/70">
            The moments, gestures, and details worth keeping about {partnerName}.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
                filter === c.id
                  ? 'bg-bae-coral text-white border-bae-coral'
                  : 'bg-bae-warm-white text-bae-navy border-bae-peach/50'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <Card variant="peach">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-bae-navy">New memory</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-white/50">
                    <X className="w-4 h-4 text-bae-navy/60" />
                  </button>
                </div>
                <div className="space-y-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Title — e.g. First sunrise together"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white text-sm placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  />
                  <textarea
                    rows="3"
                    placeholder="The details you never want to forget..."
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white text-sm placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  />
                  <Button variant="primary" className="w-full" disabled={!form.title.trim() || !form.value.trim()} onClick={handleAdd}>
                    Save memory 💛
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && (
          <Button variant="primary" className="w-full" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-1" /> Add a memory
          </Button>
        )}

        {/* Memory list */}
        {filtered.length === 0 ? (
          <Card variant="light">
            <div className="text-center py-6">
              <p className="text-4xl mb-3">📖</p>
              <p className="text-sm font-semibold text-bae-navy mb-1">
                {filter === 'all' ? 'Your story starts here' : 'Nothing in this chapter yet'}
              </p>
              <p className="text-xs text-bae-navy/60">
                Capture the small things — they become the big things.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((memory, idx) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card variant="light" hover={false}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{memory.emoji || '💭'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-bae-navy">{memory.title}</p>
                      <p className="text-sm text-bae-navy/70 mt-0.5">{memory.value}</p>
                      {memory.date && (
                        <p className="text-[11px] text-bae-navy/40 mt-1">{memory.date}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className={`p-2 rounded-full transition flex-shrink-0 ${
                        confirmDelete === memory.id ? 'bg-red-100 text-red-500' : 'text-bae-navy/30 hover:bg-bae-peach/40'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {confirmDelete === memory.id && (
                    <p className="text-[11px] text-red-500 text-right mt-1">Tap again to delete</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation activeTab="memories" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default MemoriesPage;
