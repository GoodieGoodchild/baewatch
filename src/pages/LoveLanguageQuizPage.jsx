import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { loveLanguages } from '../services/loveLanguages';
import { receiveScenarios, giveScenarios, scoreLanguages } from '../services/loveLanguageQuiz';

// Scenario-based love-language quiz — required before pairing. Measures how
// you RECEIVE love and how you naturally GIVE it; the gap between the two is
// shown to the couple because that's where most "I'm trying so hard" /
// "I don't feel loved" fights actually live.
export const LoveLanguageQuizPage = ({ onNavigate }) => {
  const { relationshipData, updateProfile } = useApp();
  const yourName = relationshipData.profile?.yourName || '';

  const [phase, setPhase] = useState('intro'); // intro | receive | give | result
  const [idx, setIdx] = useState(0);
  const [receiveAnswers, setReceiveAnswers] = useState({});
  const [giveAnswers, setGiveAnswers] = useState({});

  const deck = phase === 'receive' ? receiveScenarios : giveScenarios;
  const q = deck[idx];

  const pick = (lang) => {
    if (phase === 'receive') {
      const next = { ...receiveAnswers, [q.id]: lang };
      setReceiveAnswers(next);
      if (idx + 1 < receiveScenarios.length) setIdx(idx + 1);
      else { setPhase('give'); setIdx(0); }
    } else {
      const next = { ...giveAnswers, [q.id]: lang };
      setGiveAnswers(next);
      if (idx + 1 < giveScenarios.length) setIdx(idx + 1);
      else setPhase('result');
    }
  };

  const receive = phase === 'result' ? scoreLanguages(receiveAnswers) : null;
  const give = phase === 'result' ? scoreLanguages(giveAnswers) : null;
  const receiveLang = receive ? loveLanguages[receive.primary] : null;
  const giveLang = give ? loveLanguages[give.primary] : null;
  const mismatch = receive && give && receive.primary !== give.primary;

  const finish = () => {
    updateProfile({
      yourLoveLanguage: receive.primary,
      yourGivingLanguage: give.primary,
      loveLanguageScores: receive.tally,
    });
    onNavigate?.('home'); // App's gate decides what's actually next
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col justify-center px-5 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md mx-auto">
        <>
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl">💞</motion.div>
              <h2 className="text-2xl font-bold text-bae-navy">How do you speak love{yourName ? `, ${yourName}` : ''}?</h2>
              <p className="text-sm text-bae-navy/70">
                12 quick scenarios — pick what feels most true, don't overthink. We measure how you{' '}
                <strong>receive</strong> love AND how you naturally <strong>give</strong> it, because
                they're often not the same — and that gap matters.
              </p>
              <Card variant="peach">
                <p className="text-xs text-bae-navy/70">
                  Your partner will see your result — that's the point. It teaches them how to love
                  you in a way that actually lands, without you having to explain it over and over.
                </p>
              </Card>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setPhase('receive')}>
                Start
              </Button>
            </motion.div>
          )}

          {(phase === 'receive' || phase === 'give') && q && (
            <motion.div key={`${phase}-${q.id}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-bae-coral">
                  {phase === 'receive' ? '💝 RECEIVING' : '💌 GIVING'} · {idx + 1}/{deck.length}
                </p>
                <div className="flex gap-1">
                  {deck.map((_, i) => (
                    <div key={i} className={`h-1.5 w-3 rounded-full ${i <= idx ? 'bg-bae-coral' : 'bg-bae-peach'}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-bae-navy">{q.scenario}</h3>
              <div className="space-y-2.5">
                {q.options.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick(opt.lang)}
                    className="w-full text-left p-4 rounded-2xl border border-bae-peach/40 bg-bae-warm-white flex items-center gap-3 hover:bg-bae-light-peach transition"
                  >
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <span className="text-sm text-bae-navy">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'result' && receiveLang && giveLang && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center">
                <span className="text-5xl">{receiveLang.emoji}</span>
                <h2 className="text-xl font-bold text-bae-navy mt-2">You feel most loved through</h2>
                <p className="text-2xl font-bold text-bae-coral">{receiveLang.label}</p>
              </div>
              <Card variant="light">
                <p className="text-sm text-bae-navy/75">{receiveLang.receiving}</p>
              </Card>
              <Card variant="peach">
                <p className="text-xs font-semibold text-bae-navy mb-1">
                  {giveLang.emoji} But you naturally GIVE love through {giveLang.label}
                </p>
                {mismatch ? (
                  <p className="text-sm text-bae-navy/75">
                    Notice the gap: you give {giveLang.label.toLowerCase()} but need{' '}
                    {receiveLang.label.toLowerCase()} back. Your partner may be loving you in{' '}
                    <em>their</em> language and wondering why it isn't landing — and you may be doing
                    the same to them. Bae Watch will help you both bridge this.
                  </p>
                ) : (
                  <p className="text-sm text-bae-navy/75">
                    You give and receive in the same language — beautifully consistent. Just remember
                    your partner's language may be different from yours.
                  </p>
                )}
              </Card>
              <Button variant="primary" size="lg" className="w-full" onClick={finish}>
                Save my language 💛
              </Button>
            </motion.div>
          )}
        </>
      </div>
    </motion.div>
  );
};

export default LoveLanguageQuizPage;
