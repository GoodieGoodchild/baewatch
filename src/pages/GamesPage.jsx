import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Star, Trophy, Gamepad2, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isAIConfigured } from '../services/aiService';
import { generateLoveQuestion, polishGratitudeNote } from '../services/funService';
import SimultaneousReveal from '../components/games/SimultaneousReveal';
import SurpriseDrops from '../components/games/SurpriseDrops';

const baseLoveQuestions = [
  'What small thing did I do recently that made you feel loved?',
  'What does relationship support look like for you this week?',
  'What is one dream you want us to chase together?',
  'What does a perfect evening with me feel like?',
  'What do you think I admire most about you?',
];

// Guess-then-ask: there are no "correct" answers stored in an app — your
// partner is the answer key. You guess, then ask them and score it together.
const partnerQuizBase = [
  { question: 'What would {partner} pick as the perfect cozy activity?', options: ['Movie night', 'Cooking together', 'A long walk', 'Board games'] },
  { question: 'Which compliment would light {partner} up the most?', options: ['"You make me feel safe"', '"I love your laugh"', '"I\'m proud of you"', '"You make my day better"'] },
  { question: 'What date would {partner} choose next?', options: ['Beach escape', 'Mountain cabin', 'City adventure', 'Road trip'] },
  { question: 'When {partner} has a hard day, what do they secretly want first?', options: ['A hug, no words', 'To vent it all out', 'A distraction & laughter', 'Quiet company'] },
];

const gratitudePrompts = [
  'A habit you have that I truly appreciate is…',
  'One thing you did this week that made life easier is…',
  'I feel grateful for you when you…',
];

export const GamesPage = ({ onNavigate }) => {
  const { relationshipData } = useApp();
  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your partner';
  const couple = {
    profile,
    selfInsight: relationshipData.selfInsight,
    partnerInsight: relationshipData.partnerInsight,
  };

  const [currentGame, setCurrentGame] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [matches, setMatches] = useState([]); // self-reported after asking partner
  const [gratitudeAnswers, setGratitudeAnswers] = useState(['', '', '']);
  const [polished, setPolished] = useState([null, null, null]);
  const [showResults, setShowResults] = useState(false);

  // AI state
  const [loveDeck, setLoveDeck] = useState(baseLoveQuestions);
  const [baeSpark, setBaeSpark] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const partnerQuiz = partnerQuizBase.map((q) => ({
    ...q,
    question: q.question.replace('{partner}', partnerName),
  }));

  const games = [
    { id: 'love-questions', title: 'Love Questions', description: 'Meaningful questions to spark deep conversation — Bae invents new ones just for you two', icon: Heart, color: 'from-pink-200 to-rose-200' },
    { id: 'partner-quiz', title: `How Well Do You Know ${partnerName}?`, description: 'Guess, then ask them — they are the answer key', icon: Star, color: 'from-purple-200 to-indigo-200' },
    { id: 'gratitude-challenge', title: 'Gratitude Challenge', description: `Write appreciation notes — Bae tunes them to ${partnerName}'s love language`, icon: Trophy, color: 'from-yellow-200 to-orange-200' },
  ];

  const resetGame = () => {
    setCurrentGame(null);
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedOption('');
    setMatches([]);
    setGratitudeAnswers(['', '', '']);
    setPolished([null, null, null]);
    setShowResults(false);
    setLoveDeck(baseLoveQuestions);
    setBaeSpark('');
    setAiError('');
  };

  const handleStartGame = (gameId) => {
    resetGame();
    setCurrentGame(gameId);
  };

  const askBaeForQuestion = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      const res = await generateLoveQuestion(couple, loveDeck);
      setLoveDeck((deck) => {
        const next = [...deck];
        next.splice(questionIndex + 1, 0, res.question);
        return next;
      });
      setBaeSpark(res.spark || '');
      setQuestionIndex((i) => i + 1);
    } catch (e) {
      setAiError('Bae is napping — try again in a moment.');
    }
    setAiBusy(false);
  };

  const polishNote = async (idx) => {
    if (!gratitudeAnswers[idx]?.trim()) return;
    setAiBusy(true);
    setAiError('');
    try {
      const res = await polishGratitudeNote({
        note: gratitudeAnswers[idx],
        partnerName: profile.partnerName,
        partnerLoveLanguage: profile.partnerLoveLanguage,
      });
      setPolished((prev) => prev.map((p, i) => (i === idx ? res : p)));
    } catch (e) {
      setAiError('Bae is napping — try again in a moment.');
    }
    setAiBusy(false);
  };

  const handleLoveAnswer = () => {
    setBaeSpark('');
    setQuestionIndex((prev) => prev + 1);
  };

  const handleQuizGuess = () => {
    setAnswers((prev) => [...prev, selectedOption]);
    setSelectedOption('');
    if (questionIndex < partnerQuiz.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const toggleMatch = (idx) =>
    setMatches((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const loveQuestionContent = () => {
    const finished = questionIndex >= loveDeck.length;
    return (
      <Card variant="peach">
        <div>
          <div className="text-center mb-4">
            <Gamepad2 className="w-12 h-12 text-bae-coral mx-auto mb-3" />
            <h3 className="text-xl font-bold text-bae-navy mb-2">Love Questions</h3>
            <p className="text-bae-navy/70 text-sm">Take turns asking each other out loud — that's where the magic is.</p>
          </div>

          {finished ? (
            <div className="space-y-4">
              <p className="text-bae-navy font-semibold text-center">Round complete! 💛</p>
              <p className="text-bae-navy/70 text-sm text-center">
                {answers.filter(Boolean).length > 0 ? 'Look back at what you wrote and share your favourite answer with each other.' : 'Play again anytime — Bae never runs out of questions.'}
              </p>
              <Button variant="secondary" className="w-full" onClick={resetGame}>
                Play another round
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-bae-navy/70">Question {questionIndex + 1} of {loveDeck.length}</p>
              <p className="text-lg font-semibold text-bae-navy">{loveDeck[questionIndex]}</p>
              <AnimatePresence>
                {baeSpark && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-bae-coral italic"
                  >
                    ✨ Bae: {baeSpark}
                  </motion.p>
                )}
              </AnimatePresence>
              <textarea
                value={answers[questionIndex] || ''}
                onChange={(e) => {
                  const next = [...answers];
                  next[questionIndex] = e.target.value;
                  setAnswers(next);
                }}
                className="w-full min-h-[100px] rounded-3xl border border-bae-peach/50 bg-white p-4 text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                placeholder="Jot your answer (or just talk it out together)"
              />
              <Button variant="primary" className="w-full" onClick={handleLoveAnswer}>
                Next question
              </Button>
              {isAIConfigured() && (
                <Button variant="outline" className="w-full" disabled={aiBusy} onClick={askBaeForQuestion}>
                  {aiBusy ? (
                    <span className="flex items-center gap-2 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Bae is thinking…</span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4" /> Ask Bae for a question just for us</span>
                  )}
                </Button>
              )}
              {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const partnerQuizContent = () => {
    const question = partnerQuiz[questionIndex];
    return (
      <Card variant="peach">
        <div>
          <div className="text-center mb-4">
            <Gamepad2 className="w-12 h-12 text-bae-coral mx-auto mb-3" />
            <h3 className="text-xl font-bold text-bae-navy mb-2">How Well Do You Know {partnerName}?</h3>
            <p className="text-bae-navy/70 text-sm">Lock in your guesses — then ask {partnerName} and score it together.</p>
          </div>

          {showResults ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-bae-navy text-center">
                Now the fun part — ask {partnerName}! 🎉
              </p>
              <p className="text-sm text-bae-navy/70 text-center">
                Read each guess out loud. Tap the ones you got right.
              </p>
              <div className="space-y-3">
                {partnerQuiz.map((item, idx) => (
                  <button
                    key={item.question}
                    onClick={() => toggleMatch(idx)}
                    className={`w-full text-left rounded-3xl border p-4 transition ${
                      matches.includes(idx) ? 'border-green-400 bg-green-50' : 'border-bae-peach/50 bg-white'
                    }`}
                  >
                    <p className="text-sm text-bae-navy/70 mb-1">{item.question}</p>
                    <p className="text-base text-bae-navy font-semibold">
                      {matches.includes(idx) ? '✅ ' : ''}{answers[idx] || 'No guess'}
                    </p>
                  </button>
                ))}
              </div>
              <Card variant="gradient" hover={false}>
                <p className="text-sm text-bae-navy text-center font-semibold">
                  {matches.length}/{partnerQuiz.length} hearts in sync
                  {matches.length === partnerQuiz.length ? ' — soulmate status 💘' : matches.length >= 2 ? ' — you really see each other 💛' : ' — more to discover, and that\'s the fun part 🌱'}
                </p>
              </Card>
              <Button variant="secondary" className="w-full" onClick={resetGame}>
                Play again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-bae-navy/70">Question {questionIndex + 1} of {partnerQuiz.length}</p>
              <p className="text-lg font-semibold text-bae-navy">{question.question}</p>
              <div className="grid gap-3 mt-4">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant={selectedOption === option ? 'primary' : 'secondary'}
                    className="w-full text-left"
                    onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button variant="primary" className="w-full" disabled={!selectedOption} onClick={handleQuizGuess}>
                {questionIndex < partnerQuiz.length - 1 ? 'Lock it in' : 'See my guesses'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const gratitudeContent = () => (
    <Card variant="peach">
      <div>
        <div className="text-center mb-4">
          <Gamepad2 className="w-12 h-12 text-bae-coral mx-auto mb-3" />
          <h3 className="text-xl font-bold text-bae-navy mb-2">Gratitude Challenge</h3>
          <p className="text-bae-navy/70 text-sm">
            Write it rough — Bae will tune it to {partnerName}'s love language.
          </p>
        </div>

        <div className="space-y-4">
          {gratitudePrompts.map((prompt, idx) => (
            <div key={prompt} className="space-y-2 rounded-3xl border border-bae-peach/50 bg-white p-4">
              <p className="text-sm text-bae-navy/70">{prompt}</p>
              <textarea
                value={gratitudeAnswers[idx]}
                onChange={(e) => {
                  const next = [...gratitudeAnswers];
                  next[idx] = e.target.value;
                  setGratitudeAnswers(next);
                }}
                className="w-full min-h-[80px] rounded-3xl border border-bae-peach/40 bg-bae-cream p-4 text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                placeholder="Write your appreciation here"
              />
              {isAIConfigured() && gratitudeAnswers[idx]?.trim() && !polished[idx] && (
                <Button variant="outline" size="sm" className="w-full" disabled={aiBusy} onClick={() => polishNote(idx)}>
                  <span className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4" /> Make it shine for {partnerName}
                  </span>
                </Button>
              )}
              <AnimatePresence>
                {polished[idx] && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-2xl bg-bae-light-peach p-3">
                      <p className="text-xs font-semibold text-bae-coral mb-1">✨ BAE'S POLISH</p>
                      <p className="text-sm text-bae-navy italic">"{polished[idx].polished}"</p>
                      {polished[idx].why && (
                        <p className="text-[11px] text-bae-navy/50 mt-1">{polished[idx].why}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
          <div className="rounded-3xl border border-bae-peach/50 bg-white p-4 text-bae-navy/70">
            <p className="font-semibold text-bae-navy mb-1 text-sm">The challenge</p>
            <p className="text-sm">Send or read ONE note to {partnerName} today. Small words, big deposit. 💛</p>
          </div>
          <Button variant="secondary" className="w-full" onClick={resetGame}>
            Done
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderGameContent = () => {
    if (!currentGame) return null;
    if (currentGame === 'love-questions') return loveQuestionContent();
    if (currentGame === 'partner-quiz') return partnerQuizContent();
    if (currentGame === 'gratitude-challenge') return gratitudeContent();
    return null;
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'weather') onNavigate?.('weather');
  };

  return (
    <motion.div
      className="min-h-screen bg-bae-cream pb-32 pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mt-6"
        >
          <h2 className="text-2xl font-bold text-bae-navy mb-2">Relationship Games</h2>
          <p className="text-sm text-bae-navy/70">Connection, curiosity, and laughter — with Bae as your game master. ✨</p>
        </motion.div>

        {/* Play together (live, synced across both phones) */}
        {!currentGame && (
          <div className="space-y-4 mb-2">
            <p className="text-xs font-semibold text-bae-coral uppercase tracking-wide">🔗 Play together — live</p>
            <SimultaneousReveal />
            <SurpriseDrops />
            <p className="text-xs font-semibold text-bae-navy/40 uppercase tracking-wide pt-2">Or a quick solo-start game</p>
          </div>
        )}

        {!currentGame && (
          <div className="grid gap-4">
            {games.map((game, idx) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card variant="gradient">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className={`p-3 rounded-xl bg-gradient-to-br ${game.color}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-bae-navy mb-1">{game.title}</h3>
                        <p className="text-sm text-bae-navy/70 mb-3">{game.description}</p>
                        <Button variant="secondary" size="sm" onClick={() => handleStartGame(game.id)}>
                          Play Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {currentGame && (
          <div className="space-y-4">
            {renderGameContent()}
            <Button variant="ghost" className="w-full" onClick={resetGame}>
              Back to game list
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation activeTab="games" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default GamesPage;
