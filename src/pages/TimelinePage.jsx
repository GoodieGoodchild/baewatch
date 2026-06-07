import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const TimelinePage = ({ onNavigate }) => {
  const { relationshipData, addTimelineEvent, deleteTimelineEvent } = useApp();
  const timeline = [...(relationshipData.timeline || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ emoji: '💕', title: '', date: '', description: '', isAnniversary: false });

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    addTimelineEvent({ ...form });
    setForm({ emoji: '💕', title: '', date: '', description: '', isAnniversary: false });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteTimelineEvent(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4"
        >
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-1 text-bae-navy/60 text-sm mb-4 hover:text-bae-navy transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-bae-navy mb-2">Our Story 💕</h2>
            <p className="text-sm text-bae-navy/70">Every milestone that brought you here</p>
          </div>
        </motion.div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="peach">
                <h3 className="text-lg font-semibold text-bae-navy mb-4">Add a Moment</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-20">
                      <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Emoji</label>
                      <input
                        type="text"
                        value={form.emoji}
                        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-bae-coral"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Title</label>
                      <input
                        type="text"
                        placeholder="Our first date..."
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Description (optional)</label>
                    <textarea
                      placeholder="What made this moment special..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral resize-none"
                      rows="2"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isAnniversary}
                      onChange={(e) => setForm({ ...form, isAnniversary: e.target.checked })}
                      className="w-4 h-4 accent-bae-coral"
                    />
                    <span className="text-sm text-bae-navy">Is this an anniversary? 🎂</span>
                  </label>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button variant="primary" className="flex-1" onClick={handleAdd}>Save</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bae-coral text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add a Moment
          </motion.button>
        )}

        {/* Timeline */}
        {timeline.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💕</div>
            <p className="text-bae-navy/50">Your story is just beginning. Add your first milestone!</p>
          </div>
        )}

        {timeline.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-bae-peach" />

            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="relative flex gap-4"
                >
                  {/* Dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-sm ${
                    event.isAnniversary ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-bae-peach border-2 border-bae-coral'
                  }`}>
                    {event.emoji}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-2xl p-4 ${
                    event.isAnniversary
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : 'bg-white border border-bae-peach'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-bae-navy">{event.title}</h4>
                          {event.isAnniversary && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">🎂 Anniversary</span>
                          )}
                        </div>
                        <p className="text-xs text-bae-navy/50 mt-0.5">{formatDate(event.date)}</p>
                        {event.description && (
                          <p className="text-sm text-bae-navy/70 mt-2 leading-snug">{event.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                          deleteConfirm === event.id ? 'bg-red-100 text-red-500' : 'text-bae-navy/20 hover:text-red-400'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation activeTab="home" onTabChange={(tab) => {
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

export default TimelinePage;
