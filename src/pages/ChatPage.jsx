import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limitToLast, onSnapshot } from 'firebase/firestore';
import { isAIConfigured, chatJSON } from '../services/aiService';
import baeAvatar from '../assets/bae-avatar.png';

// Couple chat — a private space for the two of you, with Bae (the AI coach)
// one tap away. Type normally to talk to each other; tap "Ask Bae" and your
// next message goes to Bae, who answers in the chat where you BOTH see it.
const BAE_SYSTEM = `You are "Bae" — the warm, trauma-informed relationship coach living inside this couple's private chat.
Both partners see your replies. You know attachment theory, love languages and Gottman repair, worn lightly.
Rules: never take sides; translate, don't judge; keep replies short (2-4 sentences) and speakable;
protective behaviours are survival strategies, not flaws; end with something actionable or a gentle question when natural.
You are not a therapist and never diagnose.`;

const demoSeed = [
  { id: 'd1', senderId: 'partner', senderName: 'Maya', text: "I didn't mean to push last night. I just needed to know we were okay 💛", createdAt: 1 },
  { id: 'd2', senderId: 'me', senderName: 'Sam', text: "I know. I'm sorry I went quiet — I was flooded, not gone.", createdAt: 2 },
  { id: 'd3', senderId: 'bae', senderName: 'Bae', text: "Can I say something? Sam telling you 'flooded, not gone' IS the repair working. Maya, what would help you trust the pause next time it happens? 💛", createdAt: 3 },
];

export const ChatPage = ({ onNavigate }) => {
  const { relationshipData, relationshipId, demoMode } = useApp();
  const { currentUser } = useAuth();
  const profile = relationshipData.profile || {};
  const myName = profile.yourName || 'You';
  const partnerName = profile.partnerName || 'your partner';

  const [messages, setMessages] = useState(demoMode ? demoSeed : []);
  const [text, setText] = useState('');
  const [askBae, setAskBae] = useState(false);
  const [baeThinking, setBaeThinking] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // Live message stream (real couples). Demo runs on local state.
  useEffect(() => {
    if (demoMode || !relationshipId) return;
    const q = query(
      collection(db, 'relationships', relationshipId, 'messages'),
      orderBy('createdAt', 'asc'),
      limitToLast(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (e) => setError(`Chat unavailable (${e.code || 'connection'})`));
    return unsub;
  }, [relationshipId, demoMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, baeThinking]);

  const pushMessage = async (msg) => {
    if (demoMode) {
      setMessages((prev) => [...prev, { ...msg, id: `local-${Date.now()}-${Math.random()}`, createdAt: Date.now() }]);
      return;
    }
    await addDoc(collection(db, 'relationships', relationshipId, 'messages'), {
      ...msg,
      createdAt: Date.now(),
    });
  };

  const coupleContext = () => {
    const self = relationshipData.selfInsight;
    const partner = relationshipData.partnerSync;
    return [
      `Partner A: ${myName}${self?.dominant ? ` (attachment: ${self.dominant})` : ''}${profile.yourLoveLanguage ? `, love language: ${profile.yourLoveLanguage}` : ''}`,
      `Partner B: ${partnerName}${partner?.attachmentStyle ? ` (attachment: ${partner.attachmentStyle})` : ''}${profile.partnerLoveLanguage ? `, love language: ${profile.partnerLoveLanguage}` : ''}`,
    ].join('\n');
  };

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    setError('');

    try {
      await pushMessage({ senderId: demoMode ? 'me' : currentUser?.uid, senderName: myName, text: t, toBae: askBae });

      if (askBae && isAIConfigured()) {
        setBaeThinking(true);
        const recent = [...messages.slice(-10), { senderName: myName, text: t }]
          .map((m) => `${m.senderName}: ${m.text}`)
          .join('\n');
        const res = await chatJSON([
          { role: 'system', content: BAE_SYSTEM },
          { role: 'user', content: `This couple:\n${coupleContext()}\n\nRecent chat:\n${recent}\n\n${myName} just asked you (Bae) for input. Reply as Bae, to both of them.\nReturn JSON: { "reply": "your message" }` },
        ], { temperature: 0.75, maxTokens: 300 });
        await pushMessage({ senderId: 'bae', senderName: 'Bae', text: res.reply });
        setAskBae(false);
      }
    } catch (e) {
      setError(e.message?.slice(0, 120) || 'Message failed.');
    }
    setBaeThinking(false);
  };

  const isMine = (m) => (demoMode ? m.senderId === 'me' : m.senderId === currentUser?.uid);

  return (
    <motion.div className="min-h-screen bg-bae-cream flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="bg-bae-warm-white border-b border-bae-peach/40 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate?.('home')} className="p-1.5 hover:bg-bae-peach/30 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-bae-navy" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-bae-navy">You & {partnerName} 💕</h2>
          <p className="text-[11px] text-bae-navy/50">Bae is here whenever you need a third voice</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-md mx-auto w-full">
        {messages.length === 0 && (
          <Card variant="peach" hover={false}>
            <p className="text-sm text-bae-navy/70 text-center">
              Your private space. Say hi — or toggle ✨ and ask Bae anything about the two of you.
            </p>
          </Card>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex items-end gap-2 ${isMine(m) ? 'justify-end' : 'justify-start'}`}>
            {m.senderId === 'bae' && (
              <img src={baeAvatar} alt="Bae" className="w-9 h-9 rounded-full bg-white border border-bae-peach/50 object-cover flex-shrink-0" />
            )}
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-2.5 ${
                m.senderId === 'bae'
                  ? 'bg-gradient-to-br from-bae-light-peach to-bae-peach border border-bae-salmon/40'
                  : isMine(m)
                    ? 'bg-bae-coral text-white rounded-br-md'
                    : 'bg-bae-warm-white border border-bae-peach/40 rounded-bl-md'
              }`}
            >
              {m.senderId === 'bae' && (
                <p className="text-[10px] font-bold text-bae-coral mb-0.5">✨ BAE</p>
              )}
              {!isMine(m) && m.senderId !== 'bae' && (
                <p className="text-[10px] font-bold text-bae-coral mb-0.5">{m.senderName?.toUpperCase()}</p>
              )}
              <p className={`text-sm ${isMine(m) && m.senderId !== 'bae' ? 'text-white' : 'text-bae-navy'}`}>{m.text}</p>
            </div>
          </div>
        ))}
        {baeThinking && (
          <div className="flex items-end gap-2 justify-start">
            <img src={baeAvatar} alt="Bae" className="w-9 h-9 rounded-full bg-white border border-bae-peach/50 object-cover flex-shrink-0" />
            <div className="bg-gradient-to-br from-bae-light-peach to-bae-peach border border-bae-salmon/40 rounded-3xl px-4 py-2.5">
              <p className="text-sm text-bae-coral animate-pulse">✨ Bae is thinking…</p>
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="bg-bae-warm-white border-t border-bae-peach/40 px-4 py-3 sticky bottom-0">
        <div className="max-w-md mx-auto space-y-2">
          {askBae && (
            <p className="text-[11px] text-purple-500 font-medium">✨ Your next message goes to Bae — both of you will see the answer</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAskBae((v) => !v)}
              title="Ask Bae"
              className={`p-2.5 rounded-full transition flex-shrink-0 ${askBae ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-500'}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={askBae ? 'Ask Bae anything about you two…' : `Message ${partnerName}…`}
              className="flex-1 px-4 py-2.5 rounded-full border border-bae-peach bg-white text-sm text-bae-navy placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || baeThinking}
              className="p-2.5 rounded-full bg-bae-coral text-white disabled:opacity-40 transition flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
