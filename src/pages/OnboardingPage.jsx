import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, ArrowRight } from 'lucide-react';

export const OnboardingPage = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yourName: '',
    partnerName: '',
    relationship: 'dating',
    relationshipLength: '',
    partnerNeed: 'Emotional support',
    supportPreference: 'Quality time',
    currentMood: 'A bit drained',
    cupFullness: 65,
    partnerNotes: '',
  });

  const handleNext = () => {
    if (step === 2 && (!formData.yourName || !formData.partnerName)) {
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const stepOptions = [
    {
      title: 'Welcome to Bae Watch',
      subtitle: 'Your relationship companion',
      content: (
        <div className="space-y-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-6xl text-center"
          >
            👰
          </motion.div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-bae-navy">
              Love Better. Notice More.
            </h2>
            <p className="text-bae-navy/70">
              Build a rich profile of your partner so Bae Watch can track
              your relationship weather and keep their cup full.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Meet Each Other',
      subtitle: 'Tell us who is in this relationship',
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={formData.yourName}
            onChange={(e) =>
              setFormData({ ...formData, yourName: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
          />
          <input
            type="text"
            placeholder="Partner's name"
            value={formData.partnerName}
            onChange={(e) =>
              setFormData({ ...formData, partnerName: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
          />
          <input
            type="text"
            placeholder="How long have you been together?"
            value={formData.relationshipLength}
            onChange={(e) =>
              setFormData({ ...formData, relationshipLength: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
          />
        </div>
      ),
    },
    {
      title: 'What Does Your Partner Need Most?',
      subtitle: 'Build the first layer of their profile',
      content: (
        <div className="space-y-3">
          {[
            { value: 'Emotional support', label: 'Emotional support' },
            { value: 'Clear communication', label: 'Clear communication' },
            { value: 'Practical help', label: 'Practical help' },
            { value: 'Quality time', label: 'Quality time' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setFormData({ ...formData, partnerNeed: option.value })
              }
              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                formData.partnerNeed === option.value
                  ? 'bg-bae-coral text-white shadow-lg'
                  : 'bg-bae-light-peach text-bae-navy hover:bg-bae-peach'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: 'How Do They Prefer Support?',
      subtitle: 'Capture their style and current mood',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-bae-navy">Best support style</p>
            {[
              { value: 'Quality time', label: 'Quality time' },
              { value: 'Acts of service', label: 'Acts of service' },
              { value: 'Words of affirmation', label: 'Words of affirmation' },
              { value: 'Physical touch', label: 'Physical touch' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setFormData({ ...formData, supportPreference: option.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                  formData.supportPreference === option.value
                    ? 'bg-bae-coral text-white shadow-lg'
                    : 'bg-bae-light-peach text-bae-navy hover:bg-bae-peach'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-bae-navy">How are they feeling today?</p>
            {[
              { value: 'A bit drained', label: 'A bit drained' },
              { value: 'Open to connection', label: 'Open to connection' },
              { value: 'Feeling calm', label: 'Feeling calm' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setFormData({ ...formData, currentMood: option.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                  formData.currentMood === option.value
                    ? 'bg-bae-coral text-white shadow-lg'
                    : 'bg-bae-light-peach text-bae-navy hover:bg-bae-peach'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Fill Their Cup',
      subtitle: 'The more we know, the smarter your weather becomes',
      content: (
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-bae-coral">
              fill her cup, fill his cup
            </p>
            <h3 className="text-xl font-bold text-bae-navy">
              How full is {formData.partnerName || 'their'} cup today?
            </h3>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.cupFullness}
              onChange={(e) =>
                setFormData({ ...formData, cupFullness: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-bae-navy/70">
              <span>Empty</span>
              <span>{formData.cupFullness}%</span>
              <span>Full</span>
            </div>
          </div>

          <textarea
            rows="4"
            placeholder="What is one thing you can ask or say to better understand them?"
            value={formData.partnerNotes}
            onChange={(e) =>
              setFormData({ ...formData, partnerNotes: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
          />
        </div>
      ),
    },
  ];

  const currentStep = stepOptions[step - 1];

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="px-6 pt-6 pb-4">
        <div className="flex gap-2">
          {stepOptions.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: idx + 1 <= step ? '#FF6B5B' : '#FFE5D0',
                width: idx + 1 === step ? '60px' : '16px',
              }}
              className="h-1 rounded-full"
            />
          ))}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-bae-navy">
              {currentStep.title}
            </h2>
            <p className="text-bae-navy/60">{currentStep.subtitle}</p>
          </div>

          <div>{currentStep.content}</div>
        </motion.div>
      </div>

      <div className="px-6 pb-8 space-y-3">
        {step > 1 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleNext}
          size="lg"
        >
          {step === 5 ? (
            <>
              Start Using Bae Watch <Heart className="w-5 h-5" />
            </>
          ) : (
            <>
              Next <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default OnboardingPage;
