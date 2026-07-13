import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useApp } from '../../context/AppContext';
import { isAIConfigured } from '../../services/aiService';
import { polishGratitudeNote } from '../../services/funService';

// Async Surprise Drops ("Love Notes in the Wild") — plant a tiny surprise; your
// partner detonates it later. Delivery rides the shared relationship doc
// (surpriseDrops), and landing one feeds the existing language-win loop.
export default function SurpriseDrops() {
  const {
    relationshipData, myUid, plantSurprise, updateSurprise,
    recordLanguageWin, aiRemaining, spendAiUse,
  } = useApp();

  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your partner';
  const drops = relationshipData.surpriseDrops || [];

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Keep an incoming drop visible until it's landed (opening it must not remove
  // it before its content can render).
  const incoming = drops.filter((d) => d.from !== myUid && !d.landed);
  const mine = drops.filter((d) => d.from === myUid).slice(-3).reverse();

  const plant = async () => {
    if (!text.trim()) return;
    setBusy(true);
    let toSend = text.trim();
    // Optional: tune it to the partner's love language (respects AI budget).
    if (isAIConfigured() && aiRemaining('gratitude') > 0 && profile.partnerLoveLanguage) {
      try {
        spendAiUse('gratitude');
        const res = await polishGratitudeNote({ note: toSend, partnerName, partnerLoveLanguage: profile.partnerLoveLanguage });
        if (res?.polished) toSend = res.polished;
      } catch { /* send as written */ }
    }
    plantSurprise(toSend, profile.yourName || '');
    setText('');
    setSent(true);
    setBusy(false);
    setTimeout(() => setSent(false), 2500);
  };

  const [openedId, setOpenedId] = useState(null);
  const openDrop = (d) => { setOpenedId(d.id); updateSurprise(d.id, { opened: true }); };
  const land = (d) => { updateSurprise(d.id, { landed: true }); recordLanguageWin(); setOpenedId(null); };

  return (
    <Card variant="peach">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">💌</span>
        <h3 className="text-base font-bold text-bae-navy">Surprise Drops</h3>
      </div>
      <p className="text-sm text-bae-navy/70 mb-3">
        Plant a little surprise — a compliment, a dare, a "kiss me when you read this." {partnerName} finds it later.
      </p>

      {/* Incoming — the fun part */}
      <AnimatePresence>
        {incoming.map((d) => (
          <motion.div key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-3">
            {openedId === d.id || d.opened ? (
              <div className="bg-white rounded-2xl p-4 border border-bae-coral/30">
                <p className="text-[11px] font-semibold text-bae-coral mb-1">💌 FROM {(d.fromName || partnerName).toUpperCase()}</p>
                <p className="text-sm text-bae-navy">{d.text}</p>
                <Button variant="primary" size="sm" className="w-full mt-3" onClick={() => land(d)}>It landed 💛</Button>
              </div>
            ) : (
              <button onClick={() => openDrop(d)} className="w-full bg-white rounded-2xl p-4 border border-bae-coral/30 flex items-center gap-3 hover:bg-bae-light-peach transition">
                <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-2xl">🎁</motion.span>
                <span className="text-sm font-semibold text-bae-navy">A surprise from {d.fromName || partnerName} — tap to open</span>
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Plant one */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={`A little something for ${partnerName}…`}
        className="w-full rounded-2xl border border-bae-peach/40 bg-white p-3 text-sm text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none"
      />
      <Button variant="primary" size="sm" className="w-full mt-2" disabled={busy || !text.trim()} onClick={plant}>
        {busy ? <span className="flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4 animate-pulse" /> Wrapping…</span>
              : sent ? 'Planted! 💌'
              : <span className="flex items-center gap-2 justify-center"><Gift className="w-4 h-4" /> Plant a surprise</span>}
      </Button>

      {/* My sent drops status */}
      {mine.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] font-semibold text-bae-navy/50">YOUR DROPS</p>
          {mine.map((d) => (
            <p key={d.id} className="text-xs text-bae-navy/60 truncate">
              {d.landed ? '💛 landed' : d.opened ? '👀 opened' : '⏳ waiting'} · "{d.text}"
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
