import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { loveLanguageList } from '../services/loveLanguages';

// Teaches the five love languages, lets you confirm your own, and note your
// partner's — so Bae Watch can remind you to love them THEIR way.
export const LoveLanguagesPage = ({ onNavigate }) => {
  const { relationshipData, updateProfile } = useApp();
  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your partner';

  const [expanded, setExpanded] = useState(null);
  const [saved, setSaved] = useState(false);

  const setMine = (key) => { updateProfile({ yourLoveLanguage: key }); flash(); };
  const setPartner = (key) => { updateProfile({ partnerLoveLanguage: key }); flash(); };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1400); };

  return (
    <motion.div className="min-h-screen bg-bae-cream pb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mt-2 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate?.('home')} className="p-2 hover:bg-bae-peach/30 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-bae-navy">The 5 Love Languages</h2>
            <p className="text-xs text-bae-navy/60">Learn how you each give and receive love</p>
          </div>
        </div>

        <Card variant="peach" className="mb-4">
          <p className="text-sm text-bae-navy/75">
            We often love others the way <em>we</em> want to be loved. But your partner may hear love
            in a different language. Tap each one to learn how to speak it — then set yours and{' '}
            {partnerName}'s below.
          </p>
        </Card>

        <div className="space-y-3">
          {loveLanguageList.map((lang) => {
            const open = expanded === lang.key;
            const isMine = profile.yourLoveLanguage === lang.key;
            const isPartner = profile.partnerLoveLanguage === lang.key;
            return (
              <Card key={lang.key} variant="light" hover={false}>
                <button
                  onClick={() => setExpanded(open ? null : lang.key)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span className="text-3xl flex-shrink-0">{lang.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-bae-navy flex items-center gap-2">
                      {lang.label}
                      {isMine && <span className="text-[10px] bg-bae-coral text-white px-2 py-0.5 rounded-full">You</span>}
                      {isPartner && <span className="text-[10px] bg-bae-navy text-white px-2 py-0.5 rounded-full">{partnerName}</span>}
                    </p>
                    <p className="text-xs text-bae-navy/60">{lang.short}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-bae-navy/40 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-3">
                        <p className="text-sm text-bae-navy/75">{lang.receiving}</p>
                        <div>
                          <p className="text-xs font-semibold text-bae-coral mb-1.5">HOW TO SPEAK IT</p>
                          <ul className="space-y-1.5">
                            {lang.speakIt.map((tip, i) => (
                              <li key={i} className="text-sm text-bae-navy/75 flex gap-2">
                                <span className="text-bae-coral">•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-bae-light-peach/60 rounded-xl p-3">
                          <p className="text-xs text-bae-navy/70"><strong>Watch out:</strong> {lang.avoid}</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant={isMine ? 'primary' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setMine(lang.key)}
                          >
                            {isMine ? <span className="flex items-center gap-1 justify-center"><Check className="w-4 h-4" /> Mine</span> : 'This is me'}
                          </Button>
                          <Button
                            variant={isPartner ? 'secondary' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setPartner(lang.key)}
                          >
                            {isPartner ? <span className="flex items-center gap-1 justify-center"><Check className="w-4 h-4" /> {partnerName}</span> : `${partnerName}'s`}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        <AnimatePresence>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-green-600 font-medium mt-4"
            >
              Saved 💛
            </motion.p>
          )}
        </AnimatePresence>

        <Button variant="primary" className="w-full mt-6" onClick={() => onNavigate?.('home')}>
          Done
        </Button>
      </div>
    </motion.div>
  );
};

export default LoveLanguagesPage;
