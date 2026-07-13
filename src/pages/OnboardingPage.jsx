import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react';

// Onboarding is about YOU. We never ask you to guess your partner's inner world
// — you describe your own, and later you both learn together on your own devices.
export const OnboardingPage = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState({
    yourName: '',
    partnerName: '',
    yourMood: '',
    cupFullness: 65,
    yourNeed: '',
  });

  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  const moods = [
    { value: 'drained', label: 'A bit drained', emoji: '🥱' },
    { value: 'okay', label: 'Doing okay', emoji: '🙂' },
    { value: 'connected', label: 'Open & connected', emoji: '💛' },
    { value: 'stressed', label: 'Stressed / stretched', emoji: '😮‍💨' },
    { value: 'low', label: 'Low & tender', emoji: '🥺' },
  ];

  const needs = [
    { value: 'reassurance', label: 'Reassurance', emoji: '🫂' },
    { value: 'space', label: 'Space to recharge', emoji: '🌙' },
    { value: 'listening', label: 'To be heard', emoji: '👂' },
    { value: 'fun', label: 'Fun & lightness', emoji: '🎉' },
    { value: 'help', label: 'Practical help', emoji: '🛠️' },
    { value: 'affection', label: 'Affection', emoji: '💕' },
  ];

  // Each step gates the Next button on its own required field (except optional ones).
  const steps = [
    { id: 'welcome', canAdvance: () => true },
    { id: 'name', canAdvance: () => data.yourName.trim().length > 0 },
    { id: 'mood', canAdvance: () => Boolean(data.yourMood) },
    { id: 'need', canAdvance: () => Boolean(data.yourNeed) },
    { id: 'partner', canAdvance: () => true }, // partner name optional
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const go = (dir) => {
    setDirection(dir);
    if (dir > 0 && isLast) {
      onComplete?.(data);
      return;
    }
    setStep((s) => Math.min(steps.length - 1, Math.max(0, s + dir)));
  };

  const GlowGrid = ({ options, value, onSelect }) => (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.96 }}
            animate={
              active
                ? { boxShadow: '0 0 0 3px rgba(255,107,91,0.35), 0 8px 20px rgba(255,107,91,0.25)' }
                : { boxShadow: '0 0 0 0px rgba(255,107,91,0)' }
            }
            onClick={() => onSelect(opt.value)}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition ${
              active ? 'bg-bae-peach border-bae-coral' : 'bg-bae-warm-white border-bae-peach/40'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-sm font-medium text-bae-navy text-center leading-tight">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );

  const variants = {
    enter: (d) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
  };

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* progress */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: idx <= step ? '#FF6B5B' : '#FFE5D0',
                width: idx === step ? '48px' : '14px',
              }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-6">
        {/* Keyed re-mount (no AnimatePresence mode="wait"): several steps have
            infinite child animations, which stall mode="wait" exit forever and
            freeze the step on screen. A plain enter animation is robust. */}
        <div className="overflow-hidden">
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            {current.id === 'welcome' && (
              <div className="space-y-6 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-6xl"
                >
                  🌱
                </motion.div>
                <h2 className="text-3xl font-bold text-bae-navy">Let's start with you</h2>
                <p className="text-bae-navy/70">
                  Great relationships begin with self-understanding. We'll set up <em>your</em> world
                  first — how you feel, what you need, how you love. Your partner does the same on
                  their own device, and then you learn about each other together.
                </p>
              </div>
            )}

            {current.id === 'name' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-bae-navy">What should we call you?</h2>
                  <p className="text-bae-navy/60 text-sm">This is your space.</p>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Your name"
                  value={data.yourName}
                  onChange={(e) => set({ yourName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral text-center text-lg"
                />
              </div>
            )}

            {current.id === 'mood' && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-bae-navy">How are you, really?</h2>
                  <p className="text-bae-navy/60 text-sm">No wrong answer. Just you, right now.</p>
                </div>
                <GlowGrid options={moods} value={data.yourMood} onSelect={(v) => set({ yourMood: v })} />
                <Card variant="light">
                  <p className="text-sm font-semibold text-bae-navy mb-2 text-center">
                    How full is your cup today?
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.cupFullness}
                    onChange={(e) => set({ cupFullness: Number(e.target.value) })}
                    className="w-full accent-bae-coral"
                  />
                  <div className="flex justify-between text-xs text-bae-navy/60">
                    <span>Empty</span>
                    <span>{data.cupFullness}%</span>
                    <span>Full</span>
                  </div>
                </Card>
              </div>
            )}

            {current.id === 'need' && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-bae-navy">What do you need most right now?</h2>
                  <p className="text-bae-navy/60 text-sm">Naming it is the first step to getting it.</p>
                </div>
                <GlowGrid options={needs} value={data.yourNeed} onSelect={(v) => set({ yourNeed: v })} />
              </div>
            )}

            {current.id === 'partner' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-bae-navy">Who are you sharing this with?</h2>
                  <p className="text-bae-navy/60 text-sm">
                    Just their name, for now — you'll invite them to their own space next. (Optional)
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Partner's name (optional)"
                  value={data.partnerName}
                  onChange={(e) => set({ partnerName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral text-center text-lg"
                />
                <Card variant="peach">
                  <p className="text-xs text-bae-navy/70 text-center">
                    💡 You'll each build your own profile. Bae Watch then teaches you how to love{' '}
                    <em>each other's</em> way — no mind-reading required.
                  </p>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <Button variant="ghost" className="flex-1 flex items-center justify-center gap-1" onClick={() => go(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          className="flex-1 flex items-center justify-center gap-2"
          disabled={!current.canAdvance()}
          onClick={() => go(1)}
        >
          {isLast ? (
            <>Start Bae Watch <Heart className="w-5 h-5" /></>
          ) : (
            <>Continue <ArrowRight className="w-5 h-5" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default OnboardingPage;
