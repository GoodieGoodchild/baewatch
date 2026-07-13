import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useApp } from '../../context/AppContext';
import { isAIConfigured } from '../../services/aiService';
import { generateLoveQuestion, generateRevealReflection, revealPrompts } from '../../services/funService';

// Simultaneous Reveal ("Snap") — both partners answer the same prompt BLIND on
// their own phones; the answers flip face-up together. No editing after you see
// theirs. State lives on the shared relationship doc (gameSession) so both
// devices stay in sync. In demo mode we simulate the partner so it's playable.
export default function SimultaneousReveal() {
  const {
    relationshipData, demoMode, myUid, aiRemaining, spendAiUse,
    startRevealGame, submitRevealAnswer, endRevealGame,
  } = useApp();

  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your partner';
  const session = relationshipData.gameSession;
  const couple = { profile, selfInsight: relationshipData.selfInsight, partnerInsight: relationshipData.partnerInsight };

  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const myAnswer = session?.answers?.[myUid];
  const partnerAnswered = session && Object.keys(session.answers || {}).some((u) => u !== myUid);

  const newRound = async () => {
    setBusy(true);
    let prompt = revealPrompts[Math.floor(Math.random() * revealPrompts.length)];
    let spark = '';
    if (isAIConfigured() && aiRemaining('gameQuestion') > 0) {
      try {
        spendAiUse('gameQuestion');
        const res = await generateLoveQuestion(couple, []);
        if (res?.question) { prompt = res.question; spark = res.spark || ''; }
      } catch { /* fall back to the static prompt */ }
    }
    startRevealGame(prompt, spark);
    setAnswer('');
    setBusy(false);
  };

  const submit = async () => {
    if (!answer.trim()) return;
    setBusy(true);
    const mine = answer.trim();

    // Real play: if the partner already answered, I'm second → let Bae reflect.
    let reflection = '';
    if (!demoMode && partnerAnswered && isAIConfigured() && aiRemaining('gameQuestion') > 0) {
      try {
        spendAiUse('gameQuestion');
        const other = Object.entries(session.answers).find(([u]) => u !== myUid)?.[1];
        const res = await generateRevealReflection({
          couple, prompt: session.prompt, answerA: mine, answerB: other,
          nameA: profile.yourName, nameB: partnerName,
        });
        reflection = res?.line || '';
      } catch { /* no reflection is fine */ }
    }
    submitRevealAnswer(mine, reflection); // demo mode simulates the partner
    setAnswer('');
    setBusy(false);
  };

  // Not started
  if (!session) {
    return (
      <Card variant="gradient">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h3 className="text-base font-bold text-bae-navy">Snap — Simultaneous Reveal</h3>
        </div>
        <p className="text-sm text-bae-navy/70 mb-3">
          You both answer the same question <em>blind</em>, then flip at the same time. No peeking, no editing. The gasp is the point.
        </p>
        <Button variant="primary" size="sm" className="w-full" disabled={busy} onClick={newRound}>
          {busy ? <span className="flex items-center gap-2 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Dealing…</span>
                : <span className="flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4" /> Start a round</span>}
        </Button>
      </Card>
    );
  }

  // Revealed
  if (session.status === 'revealed') {
    const entries = Object.entries(session.answers || {});
    return (
      <Card variant="gradient">
        <p className="text-xs font-semibold text-bae-coral mb-1">⚡ SNAP — REVEALED</p>
        <p className="text-sm font-bold text-bae-navy mb-3">{session.prompt}</p>
        <div className="space-y-2">
          {entries.map(([uid, ans], i) => (
            <motion.div key={uid} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="bg-white/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-bae-navy/50">{uid === myUid ? 'YOU' : partnerName.toUpperCase()}</p>
              <p className="text-sm text-bae-navy">{ans}</p>
            </motion.div>
          ))}
        </div>
        {session.reflection && (
          <div className="mt-3 flex items-start gap-2">
            <span className="text-lg">✨</span>
            <p className="text-sm text-bae-navy/80 italic">{session.reflection}</p>
          </div>
        )}
        <Button variant="secondary" size="sm" className="w-full mt-4" onClick={endRevealGame}>Another round</Button>
      </Card>
    );
  }

  // Answering
  return (
    <Card variant="gradient">
      <p className="text-xs font-semibold text-bae-coral mb-1">⚡ SNAP — ANSWER BLIND</p>
      <p className="text-sm font-bold text-bae-navy mb-1">{session.prompt}</p>
      {session.spark && <p className="text-[11px] text-bae-coral italic mb-2">✨ {session.spark}</p>}
      <AnimatePresence mode="wait">
        {myAnswer ? (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <p className="text-2xl mb-1 animate-pulse">🔒</p>
            <p className="text-sm text-bae-navy/70">You're locked in. Waiting for {partnerName} to answer…</p>
            <button onClick={endRevealGame} className="text-xs text-bae-navy/40 underline mt-2">cancel round</button>
          </motion.div>
        ) : (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={2}
              placeholder="Answer honestly — they can't see it yet…"
              className="w-full rounded-2xl border border-bae-peach/40 bg-white p-3 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
            />
            <Button variant="primary" size="sm" className="w-full mt-2" disabled={busy || !answer.trim()} onClick={submit}>
              {busy ? 'Locking in…' : 'Lock in my answer 🔒'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
