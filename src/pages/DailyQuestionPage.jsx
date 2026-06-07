import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const questions = [
  "What made you feel most loved this week?",
  "What's a dream we haven't talked about yet?",
  "What would a perfect day with me look like?",
  "What's something I do that always makes you smile?",
  "What's one thing you'd love us to do more of?",
  "What does feeling truly understood by me look like?",
  "What's your favourite memory of us together?",
  "What does home feel like when you're with me?",
  "What's something you appreciate that I do without being asked?",
  "What's one thing you wish I knew about how you're feeling lately?",
  "If we had a free weekend with no plans, what would you want to do?",
  "What's a goal I could help you with right now?",
  "What's the last thing I said that really stayed with you?",
  "When do you feel most connected to me?",
  "What would help you feel most supported this week?",
  "What's something you've been wanting to tell me but haven't yet?",
  "What's a new experience you'd love for us to try?",
  "What do you love most about our relationship?",
  "How do you know when I'm proud of you?",
  "What does a good argument resolution look like to you?",
  "What small gesture means the most to you?",
  "What's something you admire about the person you're becoming?",
  "What's one thing I could do to make your mornings better?",
  "What's a strength of mine you rely on?",
  "What makes you feel safe with me?",
  "What's something you're really looking forward to?",
  "What's something you want us to get better at together?",
  "When was the last time you felt really seen by me?",
  "What's the best compliment I've ever given you?",
  "What does love mean to you right now?"
];

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getTodayString = () => new Date().toISOString().slice(0, 10);

export const DailyQuestionPage = ({ onNavigate }) => {
  const { relationshipData, saveDailyAnswer } = useApp();
  const todayStr = getTodayString();
  const todayQuestion = questions[getDayOfYear() % questions.length];
  const existingAnswer = (relationshipData.dailyAnswers || {})[todayStr];

  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(!!existingAnswer);

  const handleSave = () => {
    if (!answer.trim()) return;
    saveDailyAnswer(todayStr, answer.trim());
    setSaved(true);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-12 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate?.('home')}
            className="p-2 hover:bg-bae-peach/30 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-bae-navy" />
          </motion.button>
          <div>
            <h2 className="text-xl font-bold text-bae-navy">Daily Question</h2>
            <p className="text-xs text-bae-navy/60">{formatDate()}</p>
          </div>
        </div>

        <Card variant="gradient">
          <p className="text-xs font-semibold text-bae-coral uppercase tracking-wide mb-3">Today's question</p>
          <p className="text-xl font-bold text-bae-navy leading-snug">{todayQuestion}</p>
        </Card>

        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="answered"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card variant="light">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-1">Your answer</p>
                    <p className="text-sm text-bae-navy">{existingAnswer || answer}</p>
                  </div>
                </div>
              </Card>
              <p className="text-center text-sm text-bae-navy/60">Ask your partner the same question today 💕</p>
            </motion.div>
          ) : (
            <motion.div
              key="unanswered"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows={5}
                className="w-full rounded-2xl border border-bae-peach/40 bg-bae-warm-white p-4 text-sm text-bae-navy placeholder-bae-navy/40 resize-none focus:outline-none focus:ring-2 focus:ring-bae-coral/30"
              />
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!answer.trim()}
                className="w-full"
              >
                Save my answer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailyQuestionPage;
