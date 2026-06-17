import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ArrowLeft, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Based on Gottman Method repair principles: time-outs, radical ownership,
// active listening, sincere apology, and active building of goodwill.
const steps = [
  { id: 0, emoji: '🚦', title: 'Check in with yourself' },
  { id: 1, emoji: '🫁', title: 'Take a breath first' },
  { id: 2, emoji: '🪞', title: 'Own your part' },
  { id: 3, emoji: '🤝', title: 'Listen to understand' },
  { id: 4, emoji: '🙏', title: 'Apologize like you mean it' },
  { id: 5, emoji: '💕', title: 'Actively rebuild' },
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
  "Write them a short note of appreciation ✍️",
];

const APOLOGY_TEMPLATE =
  "I'm sorry for _____. I can see it made you feel _____, and that wasn't fair to you. Going forward, I will _____.";

const resources = [
  {
    label: 'The Gottman Institute — Repair Checklist',
    url: 'https://www.gottman.com/blog/',
  },
  {
    label: 'Psychology Today — Mastering the Art of Relationship Repair',
    url: 'https://www.psychologytoday.com/',
  },
];

const fiveRules = [
  'Take a time-out if you feel flooded or contemptuous — never repair in the heat of the moment.',
  'Own your part fully. No "but," no justifying — just ownership.',
  'Listen to understand your partner\'s pain, not to defend yourself.',
  'Apologize with impact, remorse, and a real commitment to change.',
  'Keep building goodwill — appreciation and small acts of care make repair last.',
];

const TOTAL_STEPS = steps.length;

export const RepairPage = ({ onNavigate }) => {
  const { updateConnectionLevel, updateWeatherMood, relationshipData, addRepairCommitment } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 0 — flooding / contempt gate
  const [feelsFlooded, setFeelsFlooded] = useState(null);
  const [feelsContempt, setFeelsContempt] = useState(null);
  const [takingTimeOut, setTakingTimeOut] = useState(false);

  // Step 2 — ownership
  const [ownershipText, setOwnershipText] = useState('');
  const [ownershipChecked, setOwnershipChecked] = useState([false, false]);

  // Step 3 — active listening
  const [reflectChecked, setReflectChecked] = useState([false, false, false]);

  // Step 4 — apology
  const [apologyText, setApologyText] = useState(APOLOGY_TEMPLATE);
  const [copiedApology, setCopiedApology] = useState(false);

  // Step 5 — reconnect
  const [selectedReconnect, setSelectedReconnect] = useState(null);
  const [showResources, setShowResources] = useState(false);
  const [savedCommitment, setSavedCommitment] = useState(null);

  const goTo = (target) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const advance = () => goTo(Math.min(step + 1, TOTAL_STEPS - 1));

  const needsTimeOut = feelsFlooded === true || feelsContempt === true;

  const handleCopyApology = () => {
    navigator.clipboard.writeText(apologyText).then(() => {
      setCopiedApology(true);
      setTimeout(() => setCopiedApology(false), 2000);
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

  const ToggleQuestion = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-bae-navy">{label}</p>
      <div className="flex gap-2">
        {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map((opt) => (
          <motion.button
            key={String(opt.v)}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(opt.v)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
              value === opt.v
                ? 'bg-bae-coral text-white border-bae-coral'
                : 'bg-bae-warm-white text-bae-navy border-bae-peach/40'
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const stepContent = [
    // Step 0 — Time-out gate
    <div key="step0" className="space-y-6">
      {!takingTimeOut ? (
        <>
          <p className="text-center text-sm text-bae-navy/60">
            Repair only works when both people can stay present. Be honest with yourself first.
          </p>
          <ToggleQuestion
            label="Do you feel emotionally flooded right now (racing heart, can't think straight, want to flee or fight)?"
            value={feelsFlooded}
            onChange={setFeelsFlooded}
          />
          <ToggleQuestion
            label="Are you feeling contempt toward your partner (eye-rolling, sense of superiority, mocking)?"
            value={feelsContempt}
            onChange={setFeelsContempt}
          />

          <AnimatePresence>
            {needsTimeOut && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card variant="peach">
                  <p className="text-sm font-semibold text-bae-navy mb-2">⏸️ Take a time-out first</p>
                  <p className="text-sm text-bae-navy/70 mb-3">
                    Repair conversations don't work in this state — they tend to make things worse.
                    Step away for at least 20 minutes and self-soothe before continuing.
                  </p>
                  <ul className="text-sm text-bae-navy/70 space-y-1.5 mb-3">
                    <li>• Go for a walk or change rooms</li>
                    <li>• Slow, deep breathing — in for 4, hold for 4, out for 4</li>
                    <li>• Remind yourself: "We're on the same team"</li>
                    <li>• Avoid rehearsing your argument while you wait</li>
                  </ul>
                  <Button variant="primary" className="w-full" onClick={() => setTakingTimeOut(true)}>
                    I've taken time — I'm ready now
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {feelsFlooded === false && feelsContempt === false && (
            <Button variant="primary" className="w-full" onClick={advance}>
              I'm present and ready
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-center text-sm text-bae-navy/60">
            Welcome back. Let's check in again before we begin.
          </p>
          <ToggleQuestion
            label="Do you feel emotionally flooded right now?"
            value={feelsFlooded}
            onChange={setFeelsFlooded}
          />
          <ToggleQuestion
            label="Are you feeling contempt toward your partner?"
            value={feelsContempt}
            onChange={setFeelsContempt}
          />
          {feelsFlooded === false && feelsContempt === false ? (
            <Button variant="primary" className="w-full" onClick={advance}>
              I'm present and ready
            </Button>
          ) : needsTimeOut ? (
            <Card variant="peach">
              <p className="text-sm text-bae-navy/70">
                Still feeling that way is completely okay — take more time. There's no rush to repair before you're ready.
              </p>
            </Card>
          ) : null}
        </>
      )}
    </div>,

    // Step 1 — Breathe
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

    // Step 2 — Radical Ownership
    <div key="step2" className="space-y-4">
      <Card variant="light">
        <p className="text-sm text-bae-navy/70">
          This is the hardest and most powerful step. Repair starts with owning <strong>your</strong> part —
          even if it's a small part, even if you still feel hurt too.
        </p>
      </Card>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-bae-navy">What's my part in this — even a small part?</p>
        <textarea
          value={ownershipText}
          onChange={(e) => setOwnershipText(e.target.value)}
          rows={3}
          placeholder="This is private, just for you to reflect..."
          className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
        />
      </div>
      {[
        "I can acknowledge my partner's pain without justifying my actions",
        "I'm ready to take responsibility for my part, without a 'but'",
      ].map((label, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOwnershipChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
          className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 ${
            ownershipChecked[i] ? 'bg-green-50 border-green-300' : 'bg-bae-warm-white border-bae-peach/40'
          }`}
        >
          {ownershipChecked[i] ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-bae-navy/30 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-bae-navy">{label}</p>
        </motion.button>
      ))}
      <Button variant="primary" onClick={advance} disabled={!ownershipChecked.every(Boolean)} className="w-full">
        Next
      </Button>
    </div>,

    // Step 3 — Active Listening
    <div key="step3" className="space-y-4">
      <Card variant="light">
        <p className="text-sm text-bae-navy/70">
          When your partner speaks, your only job is to <strong>understand</strong>, not defend.
          Let them finish completely before you respond.
        </p>
      </Card>
      {reflectivePrompts.map((prompt, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.98 }}
          onClick={() => setReflectChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
          className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 ${
            reflectChecked[i] ? 'bg-green-50 border-green-300' : 'bg-bae-warm-white border-bae-peach/40'
          }`}
        >
          {reflectChecked[i] ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-bae-navy/30 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-bae-navy">{prompt}</p>
        </motion.button>
      ))}
      <Button variant="primary" onClick={advance} disabled={!reflectChecked.every(Boolean)} className="w-full">
        Next
      </Button>
    </div>,

    // Step 4 — Sincere Apology
    <div key="step4" className="space-y-4">
      <Card variant="light">
        <p className="text-sm text-bae-navy/70">
          A real apology has three parts: acknowledging the <strong>impact</strong>, expressing genuine{' '}
          <strong>remorse</strong>, and committing to a specific <strong>change</strong>.
        </p>
      </Card>
      <textarea
        value={apologyText}
        onChange={(e) => setApologyText(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
      />
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleCopyApology}
        className="flex items-center gap-2 text-sm text-bae-coral font-medium"
      >
        <Copy className="w-4 h-4" />
        {copiedApology ? 'Copied!' : 'Copy to clipboard'}
      </motion.button>
      <Card variant="peach">
        <p className="text-xs text-bae-navy/70">
          Share this when you're ready. Avoid adding "but" — a real apology stands on its own.
        </p>
      </Card>
      <Button
        variant="primary"
        className="w-full"
        onClick={() => {
          // Extract the "Going forward, I will …" clause and save it as a commitment
          const match = apologyText.match(/Going forward,\s*I will\s+(.+?)\.?\s*$/i);
          const commitment = match ? match[1].trim() : null;
          if (commitment && commitment !== '_____') {
            addRepairCommitment(commitment);
            setSavedCommitment(commitment);
          }
          advance();
        }}
      >
        Next
      </Button>
    </div>,

    // Step 5 — Active Building / Reconnect
    <div key="step5" className="space-y-4">
      {savedCommitment && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="peach">
            <p className="text-xs font-semibold text-bae-navy/60 mb-1">📌 Your commitment — we'll remind you</p>
            <p className="text-sm text-bae-navy font-medium">"{savedCommitment}"</p>
            <p className="text-xs text-bae-navy/50 mt-1">
              This will appear on your home screen until you mark it kept.
            </p>
          </Card>
        </motion.div>
      )}
      <Card variant="light">
        <p className="text-sm text-bae-navy/70">
          Repair isn't just stopping the bad — it's actively practicing appreciation, emotional
          generosity, and small acts of care.
        </p>
      </Card>
      {reconnectOptions.map((option, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedReconnect(option)}
          className={`w-full text-left p-4 rounded-2xl border transition ${
            selectedReconnect === option ? 'bg-bae-peach border-bae-coral' : 'bg-bae-warm-white border-bae-peach/40'
          }`}
        >
          <p className="text-sm font-medium text-bae-navy">{option}</p>
        </motion.button>
      ))}
      <AnimatePresence>
        {selectedReconnect && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="gradient">
              <p className="text-sm text-bae-navy">
                You chose: <strong>{selectedReconnect}</strong>. That's a beautiful way to reconnect.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Button variant="primary" onClick={handleDone} disabled={!selectedReconnect} className="w-full">
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
            <h2 className="text-xl font-bold text-bae-navy">Relationship Repair Guide</h2>
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

        {/* Resources */}
        <div className="mt-8">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowResources((v) => !v)}
            className="w-full text-left text-sm font-semibold text-bae-navy/70 flex items-center justify-between px-1"
          >
            <span>📚 Want to go deeper?</span>
            <span className="text-xs">{showResources ? 'Hide' : 'Show'}</span>
          </motion.button>
          <AnimatePresence>
            {showResources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card variant="light" className="mt-3">
                  <p className="text-xs font-semibold text-bae-navy/60 mb-2">5 rules for effective repair</p>
                  <ul className="text-sm text-bae-navy/70 space-y-1.5 mb-4">
                    {fiveRules.map((rule, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-bae-coral font-semibold">{i + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-semibold text-bae-navy/60 mb-2">Learn more</p>
                  <div className="space-y-2">
                    {resources.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-bae-coral font-medium hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        {r.label}
                      </a>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default RepairPage;
