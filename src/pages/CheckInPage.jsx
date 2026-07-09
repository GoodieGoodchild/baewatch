import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';

// Personal check-in — about YOU, not a guess about your partner. What you share
// becomes something they can see and respond to on their own device.
export const CheckInPage = ({ onNavigate }) => {
  const { relationshipData, recordCheckIn } = useApp();
  const yourName = relationshipData.profile?.yourName || 'you';
  const currentCup = relationshipData.profile?.cupFullness ?? 65;
  const currentConn = relationshipData.connectionLevel ?? 72;

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [needs, setNeeds] = useState([]);
  const [cup, setCup] = useState(currentCup);
  const [submitted, setSubmitted] = useState(false);
  const [bodyMode, setBodyMode] = useState(false);
  const [nuance, setNuance] = useState(null);

  // Each state carries how it nudges your cup and the shared connection weather.
  const states = [
    { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', weather: 'stormy', cupDelta: -12, connDelta: -6 },
    { id: 'disconnected', emoji: '😢', label: 'Disconnected', weather: 'rainy', cupDelta: -10, connDelta: -8 },
    { id: 'anxious', emoji: '😰', label: 'Anxious', weather: 'rainy', cupDelta: -8, connDelta: -3 },
    { id: 'exhausted', emoji: '😴', label: 'Exhausted', weather: 'cloudy', cupDelta: -6, connDelta: -2 },
    { id: 'okay', emoji: '🙂', label: 'Okay', weather: 'cloudy', cupDelta: 2, connDelta: 1 },
    { id: 'reassured', emoji: '🤗', label: 'Held & safe', weather: 'sunny', cupDelta: 8, connDelta: 5 },
    { id: 'affectionate', emoji: '😍', label: 'Affectionate', weather: 'sunny', cupDelta: 10, connDelta: 7 },
    { id: 'loving', emoji: '💕', label: 'Full of love', weather: 'sunny', cupDelta: 12, connDelta: 8 },
  ];

  const needOptions = ['Just listen', 'Reassure me', 'Give me space', 'Physical affection', 'Help with something', 'Make me laugh'];

  // Body-first doorway: people who can't name a feeling can usually name a
  // sensation. Each sensation suggests a starting state.
  const bodySensations = [
    { label: 'Tight chest / knot', emoji: '🫀', suggests: 'anxious' },
    { label: 'Buzzing / everything is loud', emoji: '⚡', suggests: 'overwhelmed' },
    { label: 'Heavy / numb', emoji: '🪨', suggests: 'disconnected' },
    { label: 'Hollow / running on empty', emoji: '🕳️', suggests: 'exhausted' },
    { label: 'Warm / settled', emoji: '☀️', suggests: 'reassured' },
    { label: 'Light / drawn toward them', emoji: '🎈', suggests: 'affectionate' },
  ];

  // Granularity chips — moving from "bad" toward the precise feeling is the
  // actual skill this app is training.
  const nuances = {
    overwhelmed: ['Pressured', 'Stretched too thin', 'Dismissed', 'Resentful underneath'],
    disconnected: ['Unseen', 'Far away from them', 'Lonely next to them', 'Walled off'],
    anxious: ['Waiting for bad news', 'Unsure where we stand', 'Afraid I did something', 'Need to know we\'re okay'],
    exhausted: ['Physically drained', 'Emotionally spent', 'Tired of trying', 'Just need rest'],
    okay: ['Steady', 'Content', 'Coasting', 'Neutral but present'],
    reassured: ['Safe', 'Settled', 'Trusting', 'At ease'],
    affectionate: ['Playful', 'Tender', 'Missing them', 'Wanting closeness'],
    loving: ['Overflowing', 'Grateful', 'Proud of us', 'Deeply connected'],
  };

  const state = states.find((s) => s.id === selected);

  const toggleNeed = (n) =>
    setNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  const handleSubmit = () => {
    if (!state) return;
    const newCup = Math.max(0, Math.min(100, cup + state.cupDelta));
    const newConn = Math.max(0, Math.min(100, currentConn + state.connDelta));
    recordCheckIn({
      stateId: state.id,
      moodLabel: nuance ? `${state.label} — ${nuance.toLowerCase()}` : state.label,
      weatherMood: state.weather,
      cupFullness: newCup,
      connectionLevel: newConn,
      note,
      needs,
      nuance,
    });
    setSubmitted(true);
    setTimeout(() => onNavigate?.('home'), 1800);
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'games') onNavigate?.('games');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  return (
    <motion.div className="min-h-screen bg-bae-cream pb-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SafetyHeader />
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" exit={{ opacity: 0 }} className="space-y-6">
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-bae-navy mb-1">How are you feeling, {yourName}?</h2>
                <p className="text-sm text-bae-navy/70">
                  Your honest check-in. Your partner sees this and learns how to show up for you.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {states.map((s, idx) => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => { setSelected(s.id); setNuance(null); setBodyMode(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition ${
                      selected === s.id ? 'bg-bae-peach ring-2 ring-bae-coral' : 'bg-bae-light-peach hover:bg-bae-peach'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[11px] font-semibold text-bae-navy text-center leading-tight">{s.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Body-first doorway for the "I don't know what I feel" days */}
              {!selected && (
                <div>
                  <button
                    onClick={() => setBodyMode((v) => !v)}
                    className="w-full text-center text-sm font-medium text-bae-coral py-1"
                  >
                    🫀 Not sure? Start with your body instead
                  </button>
                  <AnimatePresence>
                    {bodyMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <Card variant="light" className="mt-2">
                          <p className="text-xs text-bae-navy/60 mb-3">
                            Where is it sitting in your body right now?
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {bodySensations.map((b) => (
                              <button
                                key={b.label}
                                onClick={() => { setSelected(b.suggests); setBodyMode(false); }}
                                className="p-3 rounded-2xl border border-bae-peach/40 bg-bae-warm-white text-left flex items-center gap-2 hover:bg-bae-light-peach transition"
                              >
                                <span className="text-xl">{b.emoji}</span>
                                <span className="text-xs text-bae-navy leading-tight">{b.label}</span>
                              </button>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <AnimatePresence>
                {state && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Granularity: from "bad" to the precise feeling */}
                    {nuances[state.id] && (
                      <Card variant="light">
                        <p className="text-xs font-semibold text-bae-navy/60 mb-2">
                          More precisely… (optional, but it helps {relationshipData.profile?.partnerName || 'your partner'} understand)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nuances[state.id].map((n) => (
                            <button
                              key={n}
                              onClick={() => setNuance(nuance === n ? null : n)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                                nuance === n
                                  ? 'bg-bae-coral text-white border-bae-coral'
                                  : 'bg-white text-bae-navy border-bae-peach'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </Card>
                    )}
                    <Card variant="light">
                      <p className="text-sm font-semibold text-bae-navy mb-2">
                        How full is your cup right now?
                      </p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cup}
                        onChange={(e) => setCup(Number(e.target.value))}
                        className="w-full accent-bae-coral"
                      />
                      <div className="flex justify-between text-xs text-bae-navy/60">
                        <span>Empty</span>
                        <span>{cup}%</span>
                        <span>Full</span>
                      </div>
                    </Card>

                    <Card variant="peach">
                      <p className="text-xs font-semibold text-bae-navy/60 mb-2">What's behind this? (optional)</p>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows="3"
                        placeholder="Work's been heavy and I've been missing you..."
                        className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                      />
                      <p className="text-xs font-semibold text-bae-navy/60 mt-3 mb-2">
                        What would help right now?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {needOptions.map((n) => (
                          <button
                            key={n}
                            onClick={() => toggleNeed(n)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                              needs.includes(n)
                                ? 'bg-bae-coral text-white border-bae-coral'
                                : 'bg-white text-bae-navy border-bae-peach'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </Card>

                    <div className="flex gap-3">
                      <Button variant="ghost" className="flex-1" onClick={() => setSelected(null)}>Back</Button>
                      <Button variant="primary" className="flex-1" onClick={handleSubmit}>Share check-in</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4">
                💛
              </motion.span>
              <h3 className="text-2xl font-bold text-bae-navy mb-2">Thank you for being honest</h3>
              <p className="text-sm text-bae-navy/70 max-w-xs">
                {relationshipData.profile?.partnerName || 'Your partner'} can now see how you're doing —
                and how to show up for you today.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation activeTab="checkin" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default CheckInPage;
