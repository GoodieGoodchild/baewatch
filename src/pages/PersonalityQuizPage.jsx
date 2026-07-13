import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import {
  personalityQuestions, personalitySpectrums, scorePersonality, personalityHeadline,
} from '../services/personalityQuiz';

// Day-2 personality layer. Short, warm, "how you operate" — not clinical MBTI.
// Result is stored on the profile and folded into Bae's context.
export default function PersonalityQuizPage({ onNavigate }) {
  const { relationshipData, updateProfile } = useApp();
  const yourName = relationshipData.profile?.yourName || '';

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const q = personalityQuestions[idx];
  const total = personalityQuestions.length;

  const pick = (choice) => {
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    if (idx + 1 < total) setIdx(idx + 1);
    else setDone(true);
  };

  const result = done ? scorePersonality(answers) : null;
  const headline = result ? personalityHeadline(result) : '';

  const finish = () => {
    updateProfile({ personality: { profile: result, headline, takenAt: new Date().toISOString() } });
    onNavigate?.('home');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col px-5 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate?.('home')} className="p-2 hover:bg-bae-peach/30 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-bae-navy">Your personality</h2>
            <p className="text-xs text-bae-navy/60">Day 2 · how you're wired</p>
          </div>
        </div>

        {!done ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-1 mb-6">
              {personalityQuestions.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-bae-coral' : 'bg-bae-peach'}`} />
              ))}
            </div>
            <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-xs font-semibold text-bae-coral">{idx + 1} / {total}</p>
              <h3 className="text-xl font-bold text-bae-navy">{q.text}</h3>
              <div className="space-y-3">
                <button onClick={() => pick('low')} className="w-full text-left p-4 rounded-2xl border border-bae-peach/40 bg-bae-warm-white hover:bg-bae-light-peach transition text-sm text-bae-navy">
                  {q.low}
                </button>
                <button onClick={() => pick('high')} className="w-full text-left p-4 rounded-2xl border border-bae-peach/40 bg-bae-warm-white hover:bg-bae-light-peach transition text-sm text-bae-navy">
                  {q.high}
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <span className="text-5xl">🧬</span>
              <h2 className="text-xl font-bold text-bae-navy mt-2">{yourName ? `${yourName}, you're…` : "You're…"}</h2>
              <p className="text-lg font-bold text-bae-coral">{headline}</p>
            </div>
            <div className="space-y-2">
              {personalitySpectrums.map((s) => {
                const r = result[s.key];
                const leftIsPole = r.pole === s.low;
                return (
                  <Card key={s.key} variant="light" hover={false}>
                    <div className="flex items-center justify-between text-xs text-bae-navy/50 mb-1">
                      <span>{s.lowEmoji} {s.low}</span>
                      <span>{s.high} {s.highEmoji}</span>
                    </div>
                    <div className="h-2 rounded-full bg-bae-peach/50 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-bae-coral" style={{ left: `calc(${r.score}% - 6px)` }} />
                    </div>
                    <p className="text-xs text-bae-navy/70 mt-1.5">
                      <strong>{r.pole}</strong> — {leftIsPole ? s.lowDesc : s.highDesc}
                    </p>
                  </Card>
                );
              })}
            </div>
            <Card variant="peach">
              <p className="text-xs text-bae-navy/70">
                {relationshipData.profile?.partnerName || 'Your partner'} will see this, and Bae uses it to make your cards and games sharper. 💛
              </p>
            </Card>
            <Button variant="primary" size="lg" className="w-full" onClick={finish}>Save 🧬</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
