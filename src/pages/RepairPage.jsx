import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const steps = [
  { id: 1, emoji: '🫁', title: 'Take a breath first' },
  { id: 2, emoji: '🤝', title: 'Understand before responding' },
  { id: 3, emoji: '💬', title: 'Say it with care' },
  { id: 4, emoji: '💕', title: 'Come back to each other' },
];

const reflectivePrompts = [
  "What is my partner actually feeling right now?",
  "What need of theirs isn't being met?",
  "What am I feeling underneath my reaction?",
];

const reconnectOptions = [
  "A long hug (7+ seconds) 🤗",
  "Make them their favourite drink ☕",
  "Tell them one thing you love about them 💬",
];

const TEMPLATE = "I feel _____ when _____. What I need is _____. I want us to _____.";

export const RepairPage = ({ onNavigate }) => {
  const { updateConnectionLevel, updateWeatherMood, relationshipData } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reflectChecked, setReflectChecked] = useState([false, false, false]);
  const [expressText, setExpressText] = useState(TEMPLATE);
  const [copied, setCopied] = useState(false);
  const [selectedReconnect, setSelectedReconnect] = useState(null);

  const advance = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expressText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDone = () => {
    const currentLevel = relationshipData.connectionLevel ?? 72;
    updateConnectionLevel(Math.min(100, currentLevel + 10));
    updateWeatherMood('cloudy');
    onNavigate?.('home');
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const stepContent = [
    // Step 1
    <div key="step1" className="space-y-6">
      <div className="flex justify-center">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <span className="text-4xl">🫁</span>
        </motion.div>
      </div>
      <p className="text-center text-bae-navy/70 text-sm">
        Before you talk, regulate. Take 3 slow deep breaths together.
      </p>
      <p className="text-center text-bae-navy/50 text-xs">
        Breathe in for 4... hold for 4... out for 4.
      </p>
      <Button variant="primary" onClick={advance} className="w-full">
        I'm ready
      </Button>
    </div>,

    // Step 2
    <div key="step2" className="space-y-4">
      {reflectivePrompts.map((prompt, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.98 }}
          onClick={() => setReflectChecked((prev) => prev.map((v, idx) => idx === i ? !v : v))}
          className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 ${
            reflectChecked[i]
              ? 'bg-green-50 border-green-300'
              : 'bg-bae-warm-white border-bae-peach/40'
          }`}
        >
          {reflectChecked[i]
            ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            : <div className="w-5 h-5 rounded-full border-2 border-bae-navy/30 flex-shrink-0 mt-0.5" />
          }
          <p className="text-sm text-bae-navy">{prompt}</p>
        </motion.button>
      ))}
      <Button
        variant="primary"
        onClick={advance}
        disabled={!reflectChecked.every(Boolean)}
        className="w-full"
      >
        Next
      </Button>
    </div>,

    // Step 3
    <div key="step3" className="space-y-4">
      <textarea
        value={expressText}
        onChange={(e) => setExpressText(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
      />
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleCopy}
        className="flex items-center gap-2 text-sm text-bae-coral font-medium"
      >
        <Copy className="w-4 h-4" />
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </motion.button>
      <Card variant="peach">
        <p className="text-xs text-bae-navy/70">
          Share this with your partner — then listen fully to theirs without defending.
        </p>
      </Card>
      <Button variant="primary" onClick={advance} className="w-full">
        Next
      </Button>
    </div>,

    // Step 4
    <div key="step4" className="space-y-4">
      {reconnectOptions.map((option, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedReconnect(option)}
          className={`w-full text-left p-4 rounded-2xl border transition ${
            selectedReconnect === option
              ? 'bg-bae-peach border-bae-coral'
              : 'bg-bae-warm-white border-bae-peach/40'
          }`}
        >
          <p className="text-sm font-medium text-bae-navy">{option}</p>
        </motion.button>
      ))}
      <AnimatePresence>
        {selectedReconnect && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="gradient">
              <p className="text-sm text-bae-navy">
                You chose: <strong>{selectedReconnect}</strong>. That's a beautiful way to reconnect.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="primary"
        onClick={handleDone}
        disabled={!selectedReconnect}
        className="w-full"
      >
        We're good 💕
      </Button>
    </div>,
  ];

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-12 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mt-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate?.('home')}
            className="p-2 hover:bg-bae-peach/30 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-bae-navy">Conflict Repair Toolkit</h2>
            <p className="text-xs text-bae-navy/60">A guided path back to each other</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-bae-coral' : i < step ? 'w-2 bg-bae-coral/50' : 'w-2 bg-bae-peach'
              }`}
            />
          ))}
        </div>

        <div className="mb-6 text-center">
          <p className="text-2xl mb-1">{steps[step].emoji}</p>
          <h3 className="text-lg font-bold text-bae-navy">{steps[step].title}</h3>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RepairPage;
