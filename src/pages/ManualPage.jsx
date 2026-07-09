import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';

// Manual of Me — each partner writes, once and calmly, what their hard moments
// mean and what actually helps. The app then surfaces the right page to their
// partner at the right moment, so nobody has to explain themselves mid-flood.
const STATES = [
  { key: 'quiet', label: 'When I go quiet', emoji: '🤫', meansPlaceholder: "I'm regulating, not rejecting you...", helpsPlaceholder: 'Give me 20 minutes, then come sit with me...' },
  { key: 'anxious', label: "When I'm anxious", emoji: '😰', meansPlaceholder: 'My brain is looking for proof that things are okay...', helpsPlaceholder: 'Clear, direct reassurance — tell me we\'re okay, out loud...' },
  { key: 'overwhelmed', label: "When I'm overwhelmed", emoji: '😵', meansPlaceholder: 'Everything feels too loud, including feelings...', helpsPlaceholder: 'Lower the demands — one thing at a time, no big talks yet...' },
  { key: 'hurt', label: "When I'm hurt", emoji: '💔', meansPlaceholder: 'I may act cold when actually I\'m wounded...', helpsPlaceholder: 'Gently name it: "I think I hurt you — can we talk?"...' },
];

export const ManualPage = ({ onNavigate }) => {
  const { relationshipData, saveManual } = useApp();
  const partnerName = relationshipData.profile?.partnerName || 'your partner';
  const existing = relationshipData.manual || {};

  const [manual, setManual] = useState({
    quiet: existing.quiet || { means: '', helps: '' },
    anxious: existing.anxious || { means: '', helps: '' },
    overwhelmed: existing.overwhelmed || { means: '', helps: '' },
    hurt: existing.hurt || { means: '', helps: '' },
    neverSay: existing.neverSay || '',
    alwaysWorks: existing.alwaysWorks || '',
  });
  const [saved, setSaved] = useState(false);

  const setState = (key, field, value) =>
    setManual((m) => ({ ...m, [key]: { ...m[key], [field]: value } }));

  const handleSave = () => {
    saveManual(manual);
    setSaved(true);
    setTimeout(() => onNavigate?.('home'), 1200);
  };

  const inputCls =
    'w-full rounded-2xl border border-bae-peach/40 bg-white p-3 text-sm text-bae-navy placeholder-bae-navy/35 focus:outline-none focus:ring-2 focus:ring-bae-coral/30 resize-none';

  return (
    <motion.div className="min-h-screen bg-bae-cream pb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mt-2 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate?.('home')} className="p-2 hover:bg-bae-peach/30 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-bae-navy">Manual of Me 📖</h2>
            <p className="text-xs text-bae-navy/60">Explain yourself once — calmly — instead of forever</p>
          </div>
        </div>

        <Card variant="peach" className="mb-4">
          <p className="text-sm text-bae-navy/75">
            Write this on a good day. When you're having a hard one, Bae Watch shows{' '}
            {partnerName} the right page at the right moment — so you're understood without having
            to find words when you have none.
          </p>
        </Card>

        <div className="space-y-4">
          {STATES.map((s) => (
            <Card key={s.key} variant="light" hover={false}>
              <p className="text-sm font-bold text-bae-navy mb-2">{s.emoji} {s.label}…</p>
              <p className="text-xs font-semibold text-bae-coral mb-1">WHAT'S REALLY HAPPENING</p>
              <textarea
                rows={2}
                value={manual[s.key].means}
                onChange={(e) => setState(s.key, 'means', e.target.value)}
                placeholder={s.meansPlaceholder}
                className={inputCls}
              />
              <p className="text-xs font-semibold text-bae-coral mb-1 mt-3">WHAT ACTUALLY HELPS</p>
              <textarea
                rows={2}
                value={manual[s.key].helps}
                onChange={(e) => setState(s.key, 'helps', e.target.value)}
                placeholder={s.helpsPlaceholder}
                className={inputCls}
              />
            </Card>
          ))}

          <Card variant="light" hover={false}>
            <p className="text-xs font-semibold text-bae-coral mb-1">🚫 PLEASE NEVER SAY</p>
            <textarea
              rows={2}
              value={manual.neverSay}
              onChange={(e) => setManual((m) => ({ ...m, neverSay: e.target.value }))}
              placeholder={'"You’re overreacting." / "Calm down."'}
              className={inputCls}
            />
            <p className="text-xs font-semibold text-bae-coral mb-1 mt-3">💛 ALWAYS WORKS</p>
            <textarea
              rows={2}
              value={manual.alwaysWorks}
              onChange={(e) => setManual((m) => ({ ...m, alwaysWorks: e.target.value }))}
              placeholder="Sit next to me without talking. Bring me water. Hold my hand."
              className={inputCls}
            />
          </Card>

          <Button variant="primary" size="lg" className="w-full" onClick={handleSave}>
            {saved ? <span className="flex items-center gap-2 justify-center"><Check className="w-5 h-5" /> Saved — {partnerName} can see this now</span> : 'Save my manual 💛'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ManualPage;
