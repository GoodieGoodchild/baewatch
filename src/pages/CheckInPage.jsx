import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';

const emotionalStates = [
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: 'from-red-200 to-pink-200', weatherMood: 'rainy', cupDelta: -15, connectionDelta: -10, moodLabel: 'Stressed' },
  { id: 'disconnected', emoji: '😢', label: 'Disconnected', color: 'from-blue-200 to-cyan-200', weatherMood: 'rainy', cupDelta: -12, connectionDelta: -15, moodLabel: 'Feeling distant' },
  { id: 'affectionate', emoji: '😍', label: 'Affectionate', color: 'from-pink-200 to-rose-200', weatherMood: 'sunny', cupDelta: 10, connectionDelta: 12, moodLabel: 'Happy and connected' },
  { id: 'exhausted', emoji: '😴', label: 'Exhausted', color: 'from-purple-200 to-indigo-200', weatherMood: 'cloudy', cupDelta: -10, connectionDelta: -5, moodLabel: 'Needs connection' },
  { id: 'reassurance', emoji: '🤗', label: 'Need Reassurance', color: 'from-yellow-200 to-orange-200', weatherMood: 'cloudy', cupDelta: -8, connectionDelta: -8, moodLabel: 'Needs connection' },
  { id: 'space', emoji: '😌', label: 'Need Space', color: 'from-green-200 to-emerald-200', weatherMood: 'windy', cupDelta: 0, connectionDelta: -5, moodLabel: 'Content' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-orange-200 to-yellow-200', weatherMood: 'rainy', cupDelta: -12, connectionDelta: -8, moodLabel: 'Stressed' },
  { id: 'loving', emoji: '💕', label: 'Loving', color: 'from-rose-200 to-pink-200', weatherMood: 'sunny', cupDelta: 12, connectionDelta: 15, moodLabel: 'Happy and connected' },
];

const helpOptions = ['Listen', 'Help with tasks', 'Give space', 'Physical affection', 'Reassure them'];

export const CheckInPage = ({ onNavigate }) => {
  const { relationshipData, recordCheckIn, streak } = useApp();
  const profile = relationshipData.profile || {};

  const [selectedState, setSelectedState] = useState(null);
  const [note, setNote] = useState('');
  const [helpActions, setHelpActions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleHelp = (option) => {
    setHelpActions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    const state = emotionalStates.find((s) => s.id === selectedState);
    if (!state) return;

    const currentCup = profile.cupFullness ?? 72;
    const currentConnection = relationshipData.connectionLevel ?? 72;

    recordCheckIn({
      stateId: state.id,
      moodLabel: state.moodLabel,
      weatherMood: state.weatherMood,
      cupFullness: Math.min(100, Math.max(0, currentCup + state.cupDelta)),
      connectionLevel: Math.min(100, Math.max(0, currentConnection + state.connectionDelta)),
      note,
      helpActions,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSelectedState(null);
      setNote('');
      setHelpActions([]);
      setSubmitted(false);
    }, 2500);
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'games') onNavigate?.('games');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  const streakCount = streak?.current ?? 0;

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
          className="text-center mt-6"
        >
          {/* Streak badge */}
          <div className="flex justify-center mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold
              ${streakCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-bae-light-peach text-bae-navy/60'}`}>
              🔥
              {streakCount > 0
                ? `${streakCount} day streak!`
                : 'Start your streak today'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-bae-navy mb-2">
            How is your person feeling?
          </h2>
          <p className="text-sm text-bae-navy/70">
            Quick check-in to understand your partner's emotional rhythm today.
          </p>
        </motion.div>

        {!submitted ? (
          <>
            {/* Emotional States Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-4 gap-3">
                {emotionalStates.map((state, idx) => (
                  <motion.button
                    key={state.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedState(state.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      selectedState === state.id
                        ? `bg-gradient-to-br ${state.color} ring-2 ring-bae-coral`
                        : 'bg-bae-light-peach hover:bg-bae-peach'
                    }`}
                  >
                    <span className="text-3xl">{state.emoji}</span>
                    <span className="text-xs font-semibold text-bae-navy text-center leading-tight">
                      {state.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Selected State Details */}
            {selectedState && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="peach">
                  <h3 className="font-semibold text-bae-navy mb-3">
                    {emotionalStates.find((s) => s.id === selectedState)?.label}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-bae-navy/60 mb-2">
                        What's contributing to this?
                      </p>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Too many things to do, missing you, stressed about work..."
                        className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                        rows="3"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-bae-navy/60 mb-2">
                        How can you help right now?
                      </p>
                      <div className="space-y-2">
                        {helpOptions.map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={helpActions.includes(option)}
                              onChange={() => toggleHelp(option)}
                              className="w-4 h-4 rounded accent-bae-coral cursor-pointer"
                            />
                            <span className="text-sm text-bae-navy">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Submit Button */}
            {selectedState && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setSelectedState(null)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmit}
                >
                  Save Check-in
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-6xl mb-4"
            >
              💕
            </motion.span>
            <h3 className="text-2xl font-bold text-bae-navy mb-2">
              Check-in saved!
            </h3>
            {streakCount > 0 && (
              <p className="text-sm font-semibold text-orange-600 mb-1">
                🔥 {streakCount}-day streak!
              </p>
            )}
            <p className="text-sm text-bae-navy/70 text-center">
              We're now tracking emotional rhythms to help you support each other better.
            </p>
          </motion.div>
        )}

        {/* Tips */}
        <Card variant="light">
          <div className="space-y-3">
            <h4 className="font-semibold text-bae-navy text-sm">💡 Pro Tips</h4>
            <ul className="text-sm text-bae-navy/70 space-y-2">
              <li>• Be honest about what you observe</li>
              <li>• Check in at similar times daily</li>
              <li>• Use these insights to plan your support</li>
              <li>• Remember: This isn't judgement, it's care</li>
            </ul>
          </div>
        </Card>
      </div>

      <BottomNavigation activeTab="checkin" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default CheckInPage;
