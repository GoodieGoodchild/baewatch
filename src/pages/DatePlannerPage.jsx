import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Card from '../components/common/Card';
import { ChevronLeft, CheckCircle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDateSuggestions, DATE_IDEAS } from '../services/dateSuggestions';

const COST_LABELS = { free: 'Free', low: 'Low', medium: 'Mid', splurge: 'Splurge' };
const COST_COLORS = { free: 'bg-green-100 text-green-700', low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', splurge: 'bg-purple-100 text-purple-700' };
const ENERGY_COLORS = { low: 'bg-bae-peach text-bae-navy', medium: 'bg-bae-light-peach text-bae-navy', high: 'bg-bae-coral/20 text-bae-coral' };

const DateCard = ({ idea, isPlanned, isSuggested, onPlan, onMarkDone, isDone }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl p-4 ${isSuggested ? 'border-2 border-bae-coral bg-white' : 'bg-white border border-bae-peach'}`}
  >
    <div className="flex items-start gap-3">
      <span className="text-3xl flex-shrink-0">{idea.emoji}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-bae-navy mb-1">{idea.title}</h4>
        <p className="text-sm text-bae-navy/60 mb-2 leading-snug">{idea.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs text-bae-navy/50 bg-bae-cream px-2 py-0.5 rounded-full">⏱ {idea.duration}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COST_COLORS[idea.cost]}`}>{COST_LABELS[idea.cost]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENERGY_COLORS[idea.energyLevel]}`}>{idea.energyLevel} energy</span>
        </div>
        {isDone ? (
          <span className="text-xs font-medium text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done!</span>
        ) : isPlanned ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-bae-coral flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Planned</span>
            <button
              onClick={() => onMarkDone(idea.id)}
              className="text-xs text-bae-navy/60 border border-bae-navy/20 px-2 py-0.5 rounded-full hover:bg-bae-peach transition-colors"
            >
              Mark as done ✓
            </button>
          </div>
        ) : (
          <button
            onClick={() => onPlan(idea)}
            className="text-xs font-semibold bg-bae-coral text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-bae-salmon transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" /> Plan This Date 📅
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export const DatePlannerPage = ({ onNavigate }) => {
  const { relationshipData, planDate, markDateDone } = useApp();
  const profile = relationshipData.profile || {};
  const plannedDates = relationshipData.plannedDates || [];

  const [costFilter, setCostFilter] = useState('all');
  const [energyFilter, setEnergyFilter] = useState('all');

  const suggestions = useMemo(() => {
    const sorted = getDateSuggestions({
      supportPreference: profile.supportPreference,
      partnerNeed: profile.partnerNeed,
      connectionLevel: relationshipData.connectionLevel,
      weatherMood: relationshipData.weatherMood,
    });
    return sorted.slice(0, 5);
  }, [profile.supportPreference, profile.partnerNeed, relationshipData.connectionLevel, relationshipData.weatherMood]);

  const suggestedIds = new Set(suggestions.map((s) => s.id));

  const filteredAll = DATE_IDEAS.filter((idea) => {
    if (costFilter !== 'all' && idea.cost !== costFilter) return false;
    if (energyFilter !== 'all' && idea.energyLevel !== energyFilter) return false;
    return true;
  });

  const plannedSet = new Set(plannedDates.map((d) => d.ideaId));
  const doneSet = new Set(plannedDates.filter((d) => d.done).map((d) => d.ideaId));

  const activePlanned = plannedDates.filter((d) => !d.done);
  const doneDates = plannedDates.filter((d) => d.done);

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
            <h2 className="text-2xl font-bold text-bae-navy mb-2">Date Night Ideas 🌙</h2>
            <p className="text-sm text-bae-navy/70">Curated for you and your person</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold text-bae-navy/50 self-center">Cost:</span>
            {['all', 'free', 'low', 'medium', 'splurge'].map((c) => (
              <button
                key={c}
                onClick={() => setCostFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  costFilter === c ? 'bg-bae-coral text-white' : 'bg-white border border-bae-peach text-bae-navy/60'
                }`}
              >
                {c === 'all' ? 'All' : COST_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold text-bae-navy/50 self-center">Energy:</span>
            {['all', 'low', 'medium', 'high'].map((e) => (
              <button
                key={e}
                onClick={() => setEnergyFilter(e)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  energyFilter === e ? 'bg-bae-navy text-white' : 'bg-white border border-bae-peach text-bae-navy/60'
                }`}
              >
                {e === 'all' ? 'All' : `${e.charAt(0).toUpperCase() + e.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested For You */}
        <div>
          <h3 className="text-sm font-semibold text-bae-navy/60 uppercase tracking-wide mb-3">✨ Suggested for You</h3>
          <div className="space-y-3">
            {suggestions.map((idea, idx) => (
              <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                <DateCard
                  idea={idea}
                  isSuggested
                  isPlanned={plannedSet.has(idea.id)}
                  isDone={doneSet.has(idea.id)}
                  onPlan={planDate}
                  onMarkDone={markDateDone}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Ideas */}
        <div>
          <h3 className="text-sm font-semibold text-bae-navy/60 uppercase tracking-wide mb-3">All Ideas</h3>
          <div className="space-y-3">
            {filteredAll.map((idea, idx) => (
              <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <DateCard
                  idea={idea}
                  isSuggested={false}
                  isPlanned={plannedSet.has(idea.id)}
                  isDone={doneSet.has(idea.id)}
                  onPlan={planDate}
                  onMarkDone={markDateDone}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Planned Dates */}
        {(activePlanned.length > 0 || doneDates.length > 0) && (
          <div>
            <h3 className="text-sm font-semibold text-bae-navy/60 uppercase tracking-wide mb-3">📅 Your Planned Dates</h3>
            <div className="space-y-2">
              {activePlanned.map((d) => (
                <div key={d.ideaId} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-bae-coral">
                  <span className="font-medium text-bae-navy">{d.emoji} {d.title}</span>
                  <button
                    onClick={() => markDateDone(d.ideaId)}
                    className="text-xs text-bae-coral border border-bae-coral px-3 py-1 rounded-full hover:bg-bae-coral hover:text-white transition-colors"
                  >
                    Mark done ✓
                  </button>
                </div>
              ))}
              {doneDates.map((d) => (
                <div key={d.ideaId} className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-bae-navy/60 line-through">{d.emoji} {d.title}</span>
                </div>
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

export default DatePlannerPage;
