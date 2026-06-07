import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import { Heart, ArrowRight } from 'lucide-react';

// How the USER shows up — not about their partner
const howYouFeel = [
  { id: 'excited', emoji: '🥰', label: 'Excited & hopeful' },
  { id: 'committed', emoji: '🤝', label: 'Committed & steady' },
  { id: 'growing', emoji: '🌱', label: 'Ready to grow' },
  { id: 'curious', emoji: '🧭', label: 'Curious & learning' },
  { id: 'healing', emoji: '🌿', label: 'Healing & rebuilding' },
  { id: 'loving', emoji: '💕', label: 'Deeply in love' },
];

// What the USER needs in love
const whatYouNeed = [
  { id: 'quality-time', emoji: '⏰', label: 'Quality time together', sub: 'Being present is everything' },
  { id: 'deep-talk', emoji: '💬', label: 'Deep conversations', sub: 'Words connect us' },
  { id: 'closeness', emoji: '🤗', label: 'Physical closeness', sub: 'Touch says what words can\'t' },
  { id: 'acts', emoji: '🌸', label: 'Acts of kindness', sub: 'Love shown through doing' },
];

// How the USER wants to show up for their partner
const howYouGive = [
  { id: 'attentive', emoji: '👁️', label: 'I notice the small things' },
  { id: 'doer', emoji: '🛠️', label: 'I show love by doing' },
  { id: 'words', emoji: '✍️', label: 'I express myself with words' },
  { id: 'present', emoji: '🕯️', label: 'I give my full presence' },
];

const GlowButton = ({ selected, onClick, emoji, label, sub }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    animate={selected ? {
      boxShadow: [
        '0 0 0px rgba(255,107,91,0)',
        '0 0 24px rgba(255,107,91,0.55)',
        '0 0 12px rgba(255,107,91,0.35)',
      ],
    } : {
      boxShadow: '0 0 0px rgba(255,107,91,0)',
    }}
    transition={{ duration: 0.4 }}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left ${
      selected
        ? 'border-bae-coral bg-gradient-to-r from-bae-coral/10 to-bae-salmon/10'
        : 'border-bae-peach/50 bg-white/60 hover:border-bae-coral/40 hover:bg-bae-light-peach/50'
    }`}
  >
    <span className="text-3xl flex-shrink-0">{emoji}</span>
    <div>
      <p className={`font-semibold text-sm leading-tight ${selected ? 'text-bae-coral' : 'text-bae-navy'}`}>
        {label}
      </p>
      {sub && <p className="text-xs text-bae-navy/50 mt-0.5">{sub}</p>}
    </div>
    {selected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="ml-auto w-5 h-5 rounded-full bg-bae-coral flex items-center justify-center flex-shrink-0"
      >
        <span className="text-white text-xs">✓</span>
      </motion.div>
    )}
  </motion.button>
);

export const OnboardingPage = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yourName: '',
    partnerName: '',
    howYouFeel: '',
    whatYouNeed: '',
    howYouGive: '',
  });

  const canAdvance = () => {
    if (step === 1) return formData.yourName.trim().length > 0;
    if (step === 2) return !!formData.howYouFeel;
    if (step === 3) return !!formData.whatYouNeed;
    if (step === 4) return !!formData.howYouGive;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Map selections to the profile shape the app expects
      const needMap = {
        'quality-time': 'Quality time',
        'deep-talk': 'Clear communication',
        'closeness': 'Physical affection',
        'acts': 'Acts of service',
      };
      const supportMap = {
        'attentive': 'Quality time',
        'doer': 'Acts of service',
        'words': 'Words of affirmation',
        'present': 'Quality time',
      };
      onComplete?.({
        yourName: formData.yourName.trim(),
        partnerName: formData.partnerName.trim() || 'my person',
        partnerNeed: needMap[formData.whatYouNeed] || 'Emotional support',
        supportPreference: supportMap[formData.howYouGive] || 'Quality time',
        currentMood: 'Needs connection',
        cupFullness: 72,
        relationshipLength: '',
        partnerNotes: '',
        userFeelingId: formData.howYouFeel,
        userNeedId: formData.whatYouNeed,
        userGiveId: formData.howYouGive,
      });
    }
  };

  const totalSteps = 5;

  const steps = [
    {
      title: 'Welcome to Bae Watch',
      subtitle: 'Love better. Notice more.',
      content: (
        <div className="space-y-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-7xl text-center"
          >
            💕
          </motion.div>
          <div className="text-center space-y-3">
            <p className="text-bae-navy/70 leading-relaxed">
              This app starts with <strong>you</strong> — your needs, your style, how you show up in love.
              Your partner joins later and we grow together from there.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bae-navy/70 block">
              What should we call you?
            </label>
            <input
              type="text"
              placeholder="Your first name"
              value={formData.yourName}
              onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border-2 border-bae-peach bg-white placeholder-bae-navy/30 text-bae-navy text-lg font-medium focus:outline-none focus:border-bae-coral transition-colors"
            />
          </div>
        </div>
      ),
    },
    {
      title: `How are you showing up, ${formData.yourName || 'friend'}?`,
      subtitle: 'No right answer — just honest.',
      content: (
        <div className="space-y-3">
          {howYouFeel.map((opt) => (
            <GlowButton
              key={opt.id}
              selected={formData.howYouFeel === opt.id}
              onClick={() => setFormData({ ...formData, howYouFeel: opt.id })}
              emoji={opt.emoji}
              label={opt.label}
            />
          ))}
        </div>
      ),
    },
    {
      title: 'What do you need most in love?',
      subtitle: 'This is about you — what fills your cup.',
      content: (
        <div className="space-y-3">
          {whatYouNeed.map((opt) => (
            <GlowButton
              key={opt.id}
              selected={formData.whatYouNeed === opt.id}
              onClick={() => setFormData({ ...formData, whatYouNeed: opt.id })}
              emoji={opt.emoji}
              label={opt.label}
              sub={opt.sub}
            />
          ))}
        </div>
      ),
    },
    {
      title: 'How do you naturally show love?',
      subtitle: 'Your instinct when you care about someone.',
      content: (
        <div className="space-y-3">
          {howYouGive.map((opt) => (
            <GlowButton
              key={opt.id}
              selected={formData.howYouGive === opt.id}
              onClick={() => setFormData({ ...formData, howYouGive: opt.id })}
              emoji={opt.emoji}
              label={opt.label}
            />
          ))}
        </div>
      ),
    },
    {
      title: "One last thing",
      subtitle: "Totally optional — skip if you don't know yet.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bae-navy/70 block">
              What's your partner's name? (optional)
            </label>
            <input
              type="text"
              placeholder="Their name or nickname"
              value={formData.partnerName}
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-bae-peach bg-white placeholder-bae-navy/30 text-bae-navy text-lg font-medium focus:outline-none focus:border-bae-coral transition-colors"
            />
          </div>
          <div className="bg-bae-light-peach rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-bae-navy">💡 Here's how it works</p>
            <ul className="text-sm text-bae-navy/70 space-y-1.5">
              <li>• You'll discover your partner's needs through the app over time</li>
              <li>• Daily check-ins help you tune in to how they're feeling</li>
              <li>• Games and prompts help both of you open up naturally</li>
              <li>• Invite your partner later to sync your experiences</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Progress bar */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-2 mb-2">
          {steps.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: idx + 1 <= step ? '#FF6B5B' : '#FFE5D0',
                width: idx + 1 === step ? '48px' : '12px',
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
        <p className="text-xs text-bae-navy/40 font-medium">Step {step} of {totalSteps}</p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            <div className="space-y-1 pt-2">
              <h2 className="text-2xl font-bold text-bae-navy leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-bae-navy/55 text-sm">{currentStep.subtitle}</p>
            </div>

            <div>{currentStep.content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10 pt-4 space-y-3 max-w-md mx-auto w-full">
        {step === 5 && (
          <p className="text-center text-xs text-bae-navy/40 mb-1">
            You can always add more later from your profile.
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!canAdvance()}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            canAdvance()
              ? 'bg-gradient-to-r from-bae-coral to-bae-salmon text-white shadow-lg shadow-bae-coral/25'
              : 'bg-bae-peach text-bae-navy/30 cursor-not-allowed'
          }`}
        >
          {step === totalSteps ? (
            <>Let's go <Heart className="w-5 h-5" /></>
          ) : (
            <>Continue <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
        {step > 1 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        {step === totalSteps && (
          <button
            onClick={() => onComplete?.({ yourName: formData.yourName.trim() || 'friend', partnerName: '', partnerNeed: 'Emotional support', supportPreference: 'Quality time', currentMood: 'Needs connection', cupFullness: 72, relationshipLength: '', partnerNotes: '' })}
            className="w-full text-center text-xs text-bae-navy/35 py-1 hover:text-bae-navy/60 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default OnboardingPage;
