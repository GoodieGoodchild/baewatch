import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Mail, Copy, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export const PartnerInvitePage = ({ initialInviteCode, onComplete }) => {
  const { currentUser } = useAuth();
  const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode);
    }
  }, [initialInviteCode]);

  // Generate invite code
  const generateInviteCode = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 15);
      await addDoc(collection(db, 'invites'), {
        code,
        inviterId: currentUser.uid,
        inviterEmail: currentUser.email,
        createdAt: new Date(),
        used: false,
      });
      setInviteCode(code);
      setInviteLink(`${window.location.origin}?invite=${code}`);
    } catch (err) {
      setError('Failed to generate invite code');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    const textToCopy = inviteLink || inviteCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const q = query(
        collection(db, 'invites'),
        where('code', '==', inviteCode.trim()),
        where('used', '==', false)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const inviteDoc = querySnapshot.docs[0];
        const inviteData = inviteDoc.data();
        const inviteDocRef = doc(db, 'invites', inviteDoc.id);

        const relationshipRef = await addDoc(collection(db, 'relationships'), {
          partner1Id: inviteData.inviterId,
          partner2Id: currentUser.uid,
          createdAt: new Date(),
          inviteCode: inviteCode.trim(),
        });

        await updateDoc(inviteDocRef, {
          used: true,
          usedById: currentUser.uid,
          usedAt: new Date(),
          relationshipId: relationshipRef.id,
        });

        setSuccessMessage('You are now connected!');
        onComplete?.();
      } else {
        setError('Invalid or used invite code');
      }
    } catch (err) {
      setError('Failed to join relationship');
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-bae-light-peach via-bae-cream to-bae-warm-white flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl"
          >
            💕
          </motion.div>
          <h1 className="text-3xl font-bold text-bae-navy">Connect with Your Partner</h1>
          <p className="text-bae-navy/70">Share your relationship journey together</p>
        </div>

        <Card variant="peach">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-bae-navy mb-2">Invite Your Partner</h3>
              <p className="text-sm text-bae-navy/70 mb-4">
                Generate a code to share with your partner so they can join your relationship.
              </p>

              {!inviteCode ? (
                <Button
                  onClick={generateInviteCode}
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Invite Code'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-sm text-bae-navy/60 mb-2">Your invite code:</p>
                    <p className="text-2xl font-bold text-bae-coral">{inviteCode}</p>
                    {inviteLink && (
                      <p className="text-xs text-bae-navy/60 mt-2 break-all">Share link: {inviteLink}</p>
                    )}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="secondary"
                    className="w-full"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy Invite'}
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-bae-peach/30 pt-6">
              <h3 className="text-lg font-semibold text-bae-navy mb-2">Join with Code</h3>
              <p className="text-sm text-bae-navy/70 mb-4">
                If your partner invited you, enter their code here.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Enter invite code"
                />
                <Button
                  onClick={handleJoinWithCode}
                  variant="primary"
                  className="w-full"
                  disabled={loading || !inviteCode.trim()}
                >
                  {loading ? 'Joining...' : 'Join Relationship'}
                </Button>
              </div>
            </div>

            {successMessage && (
              <p className="text-green-600 text-sm text-center">{successMessage}</p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => onComplete?.()}
            variant="ghost"
          >
            Skip for now
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PartnerInvitePage;