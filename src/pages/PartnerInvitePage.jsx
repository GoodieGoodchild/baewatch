import React, { useState, useEffect, useRef } from 'react';
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

// Firestore writes hang (not fail) when the backend is unreachable or the
// Firestore API isn't enabled — race them against a timeout so the UI can
// tell the user what's wrong instead of spinning forever.
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout: Firestore did not respond — is the Firestore database created/enabled in the Firebase Console?')), ms)
    ),
  ]);

export const PartnerInvitePage = ({ initialInviteCode, onComplete }) => {
  const { currentUser, logout } = useAuth();
  const { isPaired, updateProfile } = useApp();

  const [myCode, setMyCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [enterCode, setEnterCode] = useState(initialInviteCode || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [justJoined, setJustJoined] = useState(false);
  const autoJoinTried = useRef(false);

  useEffect(() => {
    if (initialInviteCode) setEnterCode(initialInviteCode.toUpperCase());
  }, [initialInviteCode]);

  // Invited via link: they tapped their partner's URL, signed up, and landed
  // here with the code already known — connect them automatically. One attempt
  // only; if it fails the prefilled manual flow is right there.
  useEffect(() => {
    if (initialInviteCode && currentUser && !isPaired && !justJoined && !autoJoinTried.current) {
      autoJoinTried.current = true;
      handleJoinWithCode(initialInviteCode.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInviteCode, currentUser]);

  // Inviter has done their part — let them into the app while they wait.
  const exploreWhileWaiting = () => {
    updateProfile({ invitePending: true });
    onComplete?.();
  };

  const generateInviteCode = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const code = makeCode();
      // The code IS the document ID: knowing it is the capability to redeem
      // it, and security rules forbid listing so codes can't be enumerated.
      await withTimeout(setDoc(doc(db, 'invites', code), {
        inviterId: currentUser.uid,
        createdAt: new Date(),
        used: false,
      }));
      setMyCode(code);
      setInviteLink(`${window.location.origin}?invite=${code}`);
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setError(
          'Firestore blocked this write — the security rules need to be published. ' +
          'Firebase Console → Firestore → Rules → paste firestore.rules → Publish.'
        );
      } else {
        setError(`Could not create an invite code (${err?.code || err?.message || 'unknown error'}).`);
      }
    }
    setLoading(false);
  };

  const inviteMessage = () =>
    `Hey love 💕 I set up Bae Watch for us — it helps us understand each other better. ` +
    `Tap to join me: ${inviteLink} (or enter code ${myCode} after signing up)`;

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage())}`, '_blank', 'noopener');
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title: 'Join me on Bae Watch 💕', text: inviteMessage() });
    } catch {
      /* user cancelled the share sheet — nothing to do */
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinWithCode = async (codeOverride) => {
    const code = (typeof codeOverride === 'string' ? codeOverride : enterCode).trim().toUpperCase();
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
                  <button
                    onClick={shareToWhatsApp}
                    className="w-full flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send on WhatsApp
                  </button>
                  <div className="flex gap-2">
                    {typeof navigator !== 'undefined' && navigator.share && (
                      <Button onClick={shareNative} variant="secondary" className="flex-1" size="sm">
                        Share…
                      </Button>
                    )}
                    <Button onClick={copyToClipboard} variant="secondary" className="flex-1" size="sm">
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-bae-navy/50 text-center">
                    Waiting for them to join… you'll be connected the moment they do ✨
                  </p>
                  <Button variant="outline" className="w-full" onClick={exploreWhileWaiting}>
                    Explore the app while you wait →
                  </Button>
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

            <p className="text-center text-xs text-bae-navy/50">
              Bae Watch opens once you're both here — it takes two. 💕
            </p>
            <p className="text-center">
              <button onClick={() => logout()} className="text-xs text-bae-navy/40 underline hover:text-bae-coral">
                Sign out
              </button>
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PartnerInvitePage;
