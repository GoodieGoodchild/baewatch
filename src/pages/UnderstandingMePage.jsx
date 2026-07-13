import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, RefreshCw } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { isAIConfigured } from '../services/aiService';
import { generateTranslationCard } from '../services/insightService';
import {
  attachmentQuiz,
  attachmentStyles,
  traumaResponsePatterns,
  neurodivergenceContext,
  scoreAttachmentQuiz,
} from '../services/attachmentProfiles';

// "Understanding Me" — each partner reflects on how they show up in love, then
// the AI translates it into something their partner can actually receive.
const STEPS = ['intro', 'quiz', 'trauma', 'context', 'words', 'result'];

export const UnderstandingMePage = ({ onNavigate }) => {
  const { relationshipData, saveSelfInsight } = useApp();
  const yourName = relationshipData.profile?.yourName || '';
  const existing = relationshipData.selfInsight;

  const [stepIdx, setStepIdx] = useState(existing?.card ? STEPS.length - 1 : 0);
  const [quizAnswers, setQuizAnswers] = useState(existing?.quizAnswers || {});
  const [trauma, setTrauma] = useState(existing?.traumaResponses || []);
  const [context, setContext] = useState(existing?.neurodivergence || []);
  const [freeText, setFreeText] = useState(existing?.freeText || '');
  const [origins, setOrigins] = useState(existing?.origins || '');
  const [card, setCard] = useState(existing?.card || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const step = STEPS[stepIdx];
  const dominant = Object.keys(quizAnswers).length
    ? scoreAttachmentQuiz(quizAnswers).dominant
    : null;
  const style = dominant ? attachmentStyles[dominant] : null;

  const go = (dir) => setStepIdx((i) => Math.min(STEPS.length - 1, Math.max(0, i + dir)));

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const quizComplete = attachmentQuiz.every((q) => quizAnswers[q.id]);

  const runAI = async () => {
    setLoading(true);
    setError('');
    const traumaLabels = trauma.map(
      (id) => traumaResponsePatterns.find((t) => t.id === id)?.label
    ).filter(Boolean);
    const contextLabels = context
      .filter((id) => id !== 'none')
      .map((id) => neurodivergenceContext.find((c) => c.id === id)?.label)
      .filter(Boolean);

    const self = {
      dominant,
      traumaResponses: traumaLabels,
      neurodivergence: contextLabels,
      yourName,
      freeText,
    };

    try {
      const result = await generateTranslationCard(self);
      setCard(result);
      saveSelfInsight({
        dominant,
        quizAnswers,
        traumaResponses: trauma,
        neurodivergence: context,
        freeText,
        origins,
        card: result,
      });
      setStepIdx(STEPS.length - 1);
    } catch (e) {
      setError(e.message || 'Something went wrong generating your insight.');
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mt-2 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate?.('home')}
            className="p-2 hover:bg-bae-peach/30 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-bae-navy">Understanding Me</h2>
            <p className="text-xs text-bae-navy/60">A gentle map of how you love</p>
          </div>
        </div>

        {/* progress */}
        {step !== 'result' && (
          <div className="flex gap-1.5 mb-6">
            {STEPS.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? 'bg-bae-coral' : 'bg-bae-peach'}`}
              />
            ))}
          </div>
        )}

        <>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* INTRO */}
            {step === 'intro' && (
              <div className="space-y-5">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-6xl mb-3"
                  >
                    🪞
                  </motion.div>
                  <h3 className="text-lg font-bold text-bae-navy mb-2">
                    The best gift to your partner is a version of you that understands yourself.
                  </h3>
                </div>
                <Card variant="light">
                  <p className="text-sm text-bae-navy/70">
                    We'll reflect on how you respond to closeness, stress, and conflict — then turn
                    it into words your partner can truly understand. For example, why going quiet
                    isn't rejection, and exactly what would help instead.
                  </p>
                </Card>
                <Card variant="peach">
                  <p className="text-xs text-bae-navy/70">
                    💛 This is reflection, not diagnosis. There are no wrong answers, and nothing is
                    shared with your partner until you choose to.
                  </p>
                </Card>
                <Button variant="primary" className="w-full" onClick={() => go(1)}>
                  Let's begin
                </Button>
              </div>
            )}

            {/* QUIZ */}
            {step === 'quiz' && (
              <div className="space-y-6">
                {attachmentQuiz.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-semibold text-bae-navy">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <motion.button
                          key={opt.label}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt.style }))}
                          className={`w-full text-left p-3 rounded-2xl border flex items-center gap-3 transition ${
                            quizAnswers[q.id] === opt.style
                              ? 'bg-bae-peach border-bae-coral'
                              : 'bg-bae-warm-white border-bae-peach/40'
                          }`}
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="text-sm text-bae-navy">{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
                {style && (
                  <Card variant="gradient">
                    <p className="text-sm text-bae-navy">
                      <span className="text-lg mr-1">{style.emoji}</span>
                      Leaning <strong>{style.label}</strong> — {style.summary}
                    </p>
                  </Card>
                )}
                <Button variant="primary" className="w-full" disabled={!quizComplete} onClick={() => go(1)}>
                  Continue
                </Button>
              </div>
            )}

            {/* TRAUMA RESPONSES */}
            {step === 'trauma' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-bae-navy mb-1">
                    When you feel hurt or overwhelmed, what do you tend to do?
                  </h3>
                  <p className="text-xs text-bae-navy/60">Pick any that feel true. These are survival strategies, not flaws.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {traumaResponsePatterns.map((t) => (
                    <motion.button
                      key={t.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(trauma, setTrauma, t.id)}
                      className={`w-full text-left p-3 rounded-2xl border flex items-center gap-3 transition ${
                        trauma.includes(t.id)
                          ? 'bg-bae-peach border-bae-coral'
                          : 'bg-bae-warm-white border-bae-peach/40'
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-sm text-bae-navy">{t.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => go(-1)}>Back</Button>
                  <Button variant="primary" className="flex-1" onClick={() => go(1)}>Continue</Button>
                </div>
              </div>
            )}

            {/* CONTEXT */}
            {step === 'context' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-bae-navy mb-1">
                    Anything that shapes how you experience connection?
                  </h3>
                  <p className="text-xs text-bae-navy/60">
                    Optional — this helps us tailor guidance. For example, an autistic partner who
                    needs clear, direct words.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {neurodivergenceContext.map((c) => (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggle(context, setContext, c.id)}
                      className={`px-4 py-2.5 rounded-full border text-sm flex items-center gap-2 transition ${
                        context.includes(c.id)
                          ? 'bg-bae-coral text-white border-bae-coral'
                          : 'bg-bae-warm-white text-bae-navy border-bae-peach/40'
                      }`}
                    >
                      <span>{c.emoji}</span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => go(-1)}>Back</Button>
                  <Button variant="primary" className="flex-1" onClick={() => go(1)}>Continue</Button>
                </div>
              </div>
            )}

            {/* FREE TEXT + GENERATE */}
            {step === 'words' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-bae-navy mb-1">
                    In your own words (optional)
                  </h3>
                  <p className="text-xs text-bae-navy/60">
                    Is there something about how you love, or something you wish your partner
                    understood? Even a sentence helps.
                  </p>
                </div>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={4}
                  placeholder="When I get quiet, I'm not shutting you out — I'm trying not to say something I'll regret..."
                  className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
                />

                {!isAIConfigured() && (
                  <Card variant="peach">
                    <p className="text-xs text-bae-navy/70">
                      ⚠️ AI insights aren't configured yet. Add an OpenAI key (VITE_OPENAI_API_KEY)
                      to unlock your personalized translation card.
                    </p>
                  </Card>
                )}
                {error && (
                  <Card variant="peach">
                    <p className="text-xs text-red-600">{error}</p>
                  </Card>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-bae-navy">
                    Where might this pattern have started? (optional, private)
                  </p>
                  <p className="text-[11px] text-bae-navy/50">
                    Patterns that protect us usually learned to, somewhere. Understanding where makes
                    it easier to be patient with yourself.
                  </p>
                  <textarea
                    value={origins}
                    onChange={(e) => setOrigins(e.target.value)}
                    rows={3}
                    placeholder="Going quiet kept the peace in my house growing up..."
                    className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => go(-1)}>Back</Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={loading || !isAIConfigured() || !quizComplete}
                    onClick={runAI}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Reflecting…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <Sparkles className="w-4 h-4" /> Create my card
                      </span>
                    )}
                  </Button>
                </div>
                {/* No-AI path: the map still saves so the couple's guidance works. */}
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={!quizComplete}
                  onClick={() => {
                    saveSelfInsight({
                      dominant,
                      quizAnswers,
                      traumaResponses: trauma,
                      neurodivergence: context,
                      freeText,
                      origins,
                    });
                    onNavigate?.('home');
                  }}
                >
                  Save my map without the AI card →
                </Button>
              </div>
            )}

            {/* RESULT */}
            {step === 'result' && card && (
              <div className="space-y-4">
                <Card variant="gradient">
                  <div className="text-center mb-3">
                    <span className="text-4xl">{style?.emoji || '💛'}</span>
                    <h3 className="text-lg font-bold text-bae-navy mt-2">{card.headline}</h3>
                    {style && <p className="text-xs text-bae-navy/60 mt-1">{style.label} attachment</p>}
                  </div>
                </Card>

                <Card variant="light">
                  <p className="text-xs font-semibold text-bae-coral mb-1">WHAT I DO</p>
                  <p className="text-sm text-bae-navy/80 mb-4">{card.whatIDo}</p>
                  <p className="text-xs font-semibold text-bae-coral mb-1">WHAT'S REALLY HAPPENING</p>
                  <p className="text-sm text-bae-navy/80 mb-4">{card.whatItMeans}</p>
                  <p className="text-xs font-semibold text-bae-coral mb-1">HOW IT MAY LAND ON MY PARTNER</p>
                  <p className="text-sm text-bae-navy/80">{card.howItLands}</p>
                </Card>

                <Card variant="peach">
                  <p className="text-xs font-semibold text-bae-navy mb-2">💡 WHAT HELPS ME</p>
                  <ul className="space-y-1.5">
                    {(card.whatHelps || []).map((h, i) => (
                      <li key={i} className="text-sm text-bae-navy/80 flex gap-2">
                        <Heart className="w-4 h-4 text-bae-coral flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {card.myCommitment && (
                  <Card variant="light">
                    <p className="text-xs font-semibold text-bae-coral mb-1">MY COMMITMENT</p>
                    <p className="text-sm text-bae-navy font-medium italic">"{card.myCommitment}"</p>
                  </Card>
                )}

                <Card variant="peach">
                  <p className="text-xs text-bae-navy/70">
                    💌 When your partner completes theirs, Bae Watch will build a shared "Connection
                    Bridge" — how to meet each other in the middle.
                  </p>
                </Card>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setCard(null); setStepIdx(1); }}
                  >
                    Redo
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={() => onNavigate?.('home')}>
                    Done 💛
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      </div>
    </motion.div>
  );
};

export default UnderstandingMePage;
