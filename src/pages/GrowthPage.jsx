import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Trash2, ChevronLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' },
  { id: 'mindset', label: 'Mindset', emoji: '🧠' },
  { id: 'relationship', label: 'Relationship', emoji: '💕' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'financial', label: 'Financial', emoji: '💰' },
  { id: 'wellbeing', label: 'Wellbeing', emoji: '🌿' },
];

const isOverdue = (targetDate) => {
  if (!targetDate) return false;
  return new Date(targetDate) < new Date();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const GrowthPage = ({ onNavigate }) => {
  const { relationshipData, addGrowthGoal, updateGoalProgress, toggleGoalComplete, deleteGrowthGoal } = useApp();
  const goals = relationshipData.growthGoals || [];

  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [celebrating, setCelebrating] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'health', targetDate: '' });

  const inProgress = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  const handleAdd = () => {
    if (!form.title) return;
    addGrowthGoal({ ...form });
    setForm({ title: '', description: '', category: 'health', targetDate: '' });
    setShowForm(false);
  };

  const handleToggleComplete = (id) => {
    toggleGoalComplete(id);
    const goal = goals.find((g) => g.id === id);
    if (!goal?.completed) {
      setCelebrating(id);
      setTimeout(() => setCelebrating(null), 1500);
    }
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteGrowthGoal(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const GoalCard = ({ goal }) => {
    const cat = CATEGORIES.find((c) => c.id === goal.category) || CATEGORIES[0];
    const overdue = !goal.completed && isOverdue(goal.targetDate);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card variant="light" className="relative overflow-visible">
          {/* Celebration burst */}
          <AnimatePresence>
            {celebrating === goal.id && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.3 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{cat.emoji}</span>
            <div className="flex-1">
              <h4 className={`font-semibold text-bae-navy ${goal.completed ? 'line-through opacity-60' : ''}`}>{goal.title}</h4>
              {goal.description && <p className="text-xs text-bae-navy/60 mt-0.5">{goal.description}</p>}
              {goal.targetDate && (
                <p className={`text-xs mt-1 font-medium ${overdue ? 'text-red-500' : 'text-bae-navy/50'}`}>
                  {overdue ? '⚠️ Overdue' : `Due ${formatDate(goal.targetDate)}`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(goal.id)}
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                deleteConfirm === goal.id ? 'bg-red-100 text-red-500' : 'text-bae-navy/20 hover:text-red-400'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-bae-navy/50 mb-1">
              <span>Progress</span>
              <span>{goal.progress || 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress || 0}
              onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
              disabled={goal.completed}
              className="w-full accent-bae-coral"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-bae-coral/70">💕 Partner sees this</p>
            {!goal.completed ? (
              <button
                onClick={() => handleToggleComplete(goal.id)}
                className="text-xs font-medium text-bae-coral border border-bae-coral px-3 py-1 rounded-full hover:bg-bae-coral hover:text-white transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark complete
              </button>
            ) : (
              <button
                onClick={() => handleToggleComplete(goal.id)}
                className="text-xs font-medium text-bae-navy/40 border border-bae-navy/20 px-3 py-1 rounded-full hover:bg-bae-peach transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-1 text-bae-navy/60 text-sm mb-4 hover:text-bae-navy transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-bae-navy mb-2">Your Growth Journey 🌱</h2>
            <p className="text-sm text-bae-navy/70">Personal goals your partner can see and silently cheer on</p>
          </div>
        </motion.div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card variant="peach">
                <h3 className="text-lg font-semibold text-bae-navy mb-4">New Goal</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Goal Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Run a 5K"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Description (optional)</label>
                    <textarea
                      placeholder="Why this matters to you..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral resize-none"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-bae-navy/60 mb-1 block">Target Date (optional)</label>
                    <input
                      type="date"
                      value={form.targetDate}
                      onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-bae-peach bg-white focus:outline-none focus:ring-2 focus:ring-bae-coral"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button variant="primary" className="flex-1" onClick={handleAdd}>Save Goal</Button>
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
            Add a Goal
          </motion.button>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-bae-navy/60 uppercase tracking-wide mb-3">In Progress</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {inProgress.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-bae-navy/60 uppercase tracking-wide mb-3">Completed ✓</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {completed.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-bae-navy/50">Set a goal for yourself — growth attracts growth 🌱</p>
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

export default GrowthPage;
