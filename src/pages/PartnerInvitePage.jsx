import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Copy, Check, Heart } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDoc, updateDoc, setDoc, doc } from 'firebase/firestore';

// Short, friendly, unambiguous pairing codes (no 0/O, 1/I/L).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');

export const PartnerInvitePage = ({ initialInviteCode, onComplete }) => {
  const { currentUser } = useAuth();
  const { isPaired } = useApp();

  const [myCode, setMyCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [enterCode, setEnterCode] = useState(initialInviteCode || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [justJoined, setJustJoined] = useState(false);

  useEffect(() => {
    if (initialInviteCode) setEnterCode(initialInviteCode.toUpperCase());
  }, [initialInviteCode]);

  const generateInviteCode = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const code = makeCode();
      // The code IS the document ID: knowing it is the capability to redeem
      // it, and security rules forbid listing so codes can't be enumerated.
      await setDoc(doc(db, 'invites', code), {
        inviterId: currentUser.uid,
        createdAt: new Date(),
        used: false,
      });
      setMyCode(code);
      setInviteLink(`${window.location.origin}?invite=${code}`);
    } catch {
      setError('Could not create an invite code. Check your connection and try again.');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `Join me on Bae Watch 💕 Use code ${myCode} or tap: ${inviteLink}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinWithCode = async () => {
    const code = enterCode.trim().toUpperCase();
    if (!code || !currentUser) return;
    setJoining(true);
    setError('');
    try {
      const inviteRef = doc(db, 'invites', code);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists() || inviteSnap.data().used) {
        setError("That code wasn't found (or was already used). Double-check it with your partner.");
        setJoining(false);
        return;
      }

      const inviteData = inviteSnap.data();

      // Codes expire after 48 hours (also enforced by security rules).
      const createdAt = inviteData.createdAt?.toDate?.() || new Date(0);
      if (Date.now() - createdAt.getTime() > 48 * 60 * 60 * 1000) {
        setError('That code has expired — ask your partner to create a fresh one.');
        setJoining(false);
        return;
      }

      if (inviteData.inviterId === currentUser.uid) {
        setError("That's your own code! Share it with your partner and let them enter it.");
        setJoining(false);
        return;
      }

      const relationshipRef = await addDoc(collection(db, 'relationships'), {
        partner1Id: inviteData.inviterId,
        partner2Id: currentUser.uid,
        createdAt: new Date(),
        inviteCode: code,
      });

      await updateDoc(inviteRef, {
        used: true,
        usedById: currentUser.uid,
        usedAt: new Date(),
        relationshipId: relationshipRef.id,
      });

      // Point BOTH partners' user docs at the shared relationship — each
      // device's AppContext picks up the live sync from this id.
      await setDoc(doc(db, 'users', currentUser.uid), { relationshipId: relationshipRef.id }, { merge: true });
      await setDoc(doc(db, 'users', inviteData.inviterId), { relationshipId: relationshipRef.id }, { merge: true });

      setJustJoined(true);
    } catch {
      setError('Something went wrong joining. Try again in a moment.');
    }
    setJoining(false);
  };

  // Already paired — or pairing just happened. For the INVITER this flips live
  // the moment their partner enters the code (AppContext watches users/{uid}).
  const connected = isPaired || justJoined;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-6">
        {connected ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-5"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="text-7xl"
            >
              💞
            </motion.div>
            <h1 className="text-3xl font-bold text-bae-navy">You're connected!</h1>
            <p className="text-bae-navy/70">
              Your hearts are officially linked. Check-ins, love languages, and insights now flow
              between your devices — each of you in your own time.
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={() => onComplete?.()}>
              <Heart className="w-5 h-5 mr-2" /> Let's go
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="text-center space-y-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl"
              >
                💕
              </motion.div>
              <h1 className="text-3xl font-bold text-bae-navy">Connect Your Partner</h1>
              <p className="text-bae-navy/70 text-sm">
                Bae Watch works best as a two-player game. Link up now — it takes 30 seconds.
              </p>
            </div>

            {/* Path 1: I'm inviting */}
            <Card variant="peach">
              <h3 className="text-base font-semibold text-bae-navy mb-1">📤 Invite them</h3>
              <p className="text-sm text-bae-navy/70 mb-4">
                Get a code and send it however you like — text, WhatsApp, a sticky note on the fridge.
              </p>

              {!myCode ? (
                <Button onClick={generateInviteCode} variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Creating…' : 'Create my invite code'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-xs text-bae-navy/60 mb-1">Your code</p>
                    <p className="text-3xl font-bold text-bae-coral tracking-[0.3em]">{myCode}</p>
                  </div>
                  <Button onClick={copyToClipboard} variant="secondary" className="w-full">
                    {copied ? <Check className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5 mr-1" />}
                    {copied ? 'Copied — go send it!' : 'Copy invite message'}
                  </Button>
                  <p className="text-xs text-bae-navy/50 text-center">
                    Waiting for them to enter it… this screen updates the moment they do ✨
                  </p>
                </div>
              )}
            </Card>

            {/* Path 2: I was invited */}
            <Card variant="light">
              <h3 className="text-base font-semibold text-bae-navy mb-1">📥 Got a code?</h3>
              <p className="text-sm text-bae-navy/70 mb-4">Enter the code your partner sent you.</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={enterCode}
                  onChange={(e) => setEnterCode(e.target.value.toUpperCase())}
                  maxLength={16}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white text-center text-xl font-bold tracking-[0.25em] uppercase placeholder-bae-navy/30 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="ABC123"
                />
                <Button
                  onClick={handleJoinWithCode}
                  variant="primary"
                  className="w-full"
                  disabled={joining || !enterCode.trim()}
                >
                  {joining ? 'Linking hearts…' : 'Connect us 💞'}
                </Button>
              </div>
            </Card>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="text-center">
              <Button onClick={() => onComplete?.()} variant="ghost">
                Skip for now — I'll connect later
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PartnerInvitePage;
