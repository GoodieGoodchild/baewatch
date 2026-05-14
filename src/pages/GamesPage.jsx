import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Star, Trophy, Gamepad2 } from 'lucide-react';

const loveQuestions = [
  'What small thing did I do recently that made you feel loved?',
  'What does relationship support look like for you this week?',
  'What is one dream you want us to chase together?',
  'What does a perfect evening with me feel like?',
  'What do you think I admire most about you?',
];

const partnerQuiz = [
  {
    question: 'What is my favorite cozy activity?',
    options: ['Movie night', 'Cook together', 'Take a walk', 'Play board games'],
    tip: 'After answering, ask your partner if they agreed with your choice.',
  },
  {
    question: 'Which compliment would make me the happiest?',
    options: ['You are so thoughtful', 'I love your laugh', 'You are amazing', 'You make my day better'],
    tip: 'Compare your answers and celebrate the match.',
  },
  {
    question: 'What date idea would I choose next?',
    options: ['Beach escape', 'Mountain cabin', 'City adventure', 'Road trip'],
    tip: 'Use this to plan your next sweet surprise.',
  },
];

const gratitudePrompts = [
  'A habit you have that I truly appreciate is…',
  'One thing you did this week that made life easier is…',
  'I feel grateful for you when you…',
];

export const GamesPage = ({ onNavigate }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [gratitudeAnswers, setGratitudeAnswers] = useState(['', '', '']);
  const [showResults, setShowResults] = useState(false);

  const games = [
    {
      id: 'love-questions',
      title: 'Love Questions',
      description: 'Ask meaningful questions that spark deep conversation',
      icon: Heart,
      color: 'from-pink-200 to-rose-200',
    },
    {
      id: 'partner-quiz',
      title: 'Partner Quiz',
      description: 'Guess each other’s favorites and compare answers',
      icon: Star,
      color: 'from-purple-200 to-indigo-200',
    },
    {
      id: 'gratitude-challenge',
      title: 'Gratitude Challenge',
      description: 'Write appreciation notes that brighten your partner’s day',
      icon: Trophy,
      color: 'from-yellow-200 to-orange-200',
    },
  ];

  const resetGame = () => {
    setCurrentGame(null);
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedOption('');
    setQuizScore(0);
    setGratitudeAnswers(['', '', '']);
    setShowResults(false);
  };

  const handleStartGame = (gameId) => {
    resetGame();
    setCurrentGame(gameId);
  };

  const handleLoveAnswer = () => {
    const answer = answers[questionIndex] || 'I want to ask my partner this together.';
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answer;
      return next;
    });
    setQuestionIndex((prev) => prev + 1);
  };

  const handleQuizSubmit = () => {
    const correctAnswers = ['Cook together', 'You are so thoughtful', 'Beach escape'];
    const currentCorrect = selectedOption === correctAnswers[questionIndex] ? 1 : 0;
    setQuizScore((prev) => prev + currentCorrect);
    setAnswers((prev) => [...prev, selectedOption]);
    setSelectedOption('');
    if (questionIndex < partnerQuiz.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleGratitudeChange = (index, value) => {
    const next = [...gratitudeAnswers];
    next[index] = value;
    setGratitudeAnswers(next);
  };

  const loveQuestionContent = () => {
    const finished = questionIndex >= loveQuestions.length;

    return (
      <Card variant="peach">
        <div>
          <div className="text-center mb-4">
            <Gamepad2 className="w-12 h-12 text-bae-coral mx-auto mb-3" />
            <h3 className="text-xl font-bold text-bae-navy mb-2">Love Questions</h3>
            <p className="text-bae-navy/70">Answer questions that invite your partner into a richer conversation.</p>
          </div>

          {finished ? (
            <div className="space-y-4">
              <p className="text-bae-navy font-semibold">Round complete!</p>
              <p className="text-bae-navy/70">Share these answers with your partner and ask them to answer the same questions.</p>
              <div className="space-y-3">
                {loveQuestions.map((question, idx) => (
                  <div key={question} className="rounded-3xl border border-bae-peach/50 bg-white p-4">
                    <p className="text-sm text-bae-navy/70 mb-2">{question}</p>
                    <p className="text-base text-bae-navy font-semibold">{answers[idx] || 'No answer yet'}</p>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full" onClick={resetGame}>
                Play another round
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-bae-navy/70">Question {questionIndex + 1} of {loveQuestions.length}</p>
              <p className="text-lg font-semibold text-bae-navy">{loveQuestions[questionIndex]}</p>
              <textarea
                value={answers[questionIndex] || ''}
                onChange={(e) => {
                  const next = [...answers];
                  next[questionIndex] = e.target.value;
                  setAnswers(next);
                }}
                className="w-full min-h-[120px] rounded-3xl border border-bae-peach/50 bg-white p-4 text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                placeholder="Write your answer here"
              />
              <Button variant="primary" className="w-full" onClick={handleLoveAnswer}>
                Save answer
              </Button>
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
            <h3 className="text-xl font-bold text-bae-navy mb-2">Partner Quiz</h3>
            <p className="text-bae-navy/70">Choose the answer you think your partner would pick, then compare.</p>
          </div>

          {showResults ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-bae-navy">Quiz complete!</p>
              <p className="text-bae-navy/70">Score: {quizScore} / {partnerQuiz.length}</p>
              <div className="space-y-3">
                {partnerQuiz.map((item, idx) => (
                  <div key={item.question} className="rounded-3xl border border-bae-peach/50 bg-white p-4">
                    <p className="text-sm text-bae-navy/70 mb-2">{item.question}</p>
                    <p className="text-base text-bae-navy font-semibold">Your answer: {answers[idx] || 'No answer'}</p>
                    <p className="text-sm text-bae-navy/70 mt-2">{item.tip}</p>
                  </div>
                ))}
              </div>
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
              <Button variant="primary" className="w-full" disabled={!selectedOption} onClick={handleQuizSubmit}>
                {questionIndex < partnerQuiz.length - 1 ? 'Next question' : 'See results'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const gratitudeContent = () => {
    return (
      <Card variant="peach">
        <div>
          <div className="text-center mb-4">
            <Gamepad2 className="w-12 h-12 text-bae-coral mx-auto mb-3" />
            <h3 className="text-xl font-bold text-bae-navy mb-2">Gratitude Challenge</h3>
            <p className="text-bae-navy/70">Write notes that help your partner feel seen and celebrated.</p>
          </div>

          <div className="space-y-4">
            {gratitudePrompts.map((prompt, idx) => (
              <div key={prompt} className="space-y-2 rounded-3xl border border-bae-peach/50 bg-white p-4">
                <p className="text-sm text-bae-navy/70">{prompt}</p>
                <textarea
                  value={gratitudeAnswers[idx]}
                  onChange={(e) => handleGratitudeChange(idx, e.target.value)}
                  className="w-full min-h-[100px] rounded-3xl border border-bae-peach/40 bg-bae-cream p-4 text-bae-navy focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Write your appreciation here"
                />
              </div>
            ))}
            <div className="rounded-3xl border border-bae-peach/50 bg-white p-4 text-bae-navy/70">
              <p className="font-semibold text-bae-navy mb-2">Conversation starter</p>
              <p>Share one note with your partner and invite them to share one back.</p>
            </div>
            <Button variant="primary" className="w-full" onClick={() => setShowResults(true)}>
              Review notes
            </Button>
            {showResults && (
              <div className="space-y-3 rounded-3xl border border-bae-peach/50 bg-white p-4">
                <p className="text-lg font-semibold text-bae-navy">Your gratitude notes</p>
                {gratitudeAnswers.map((note, idx) => (
                  <div key={idx} className="rounded-3xl bg-bae-warm-white p-3 text-bae-navy/80">
                    <p className="text-sm text-bae-navy/70 mb-1">{gratitudePrompts[idx]}</p>
                    <p>{note || 'No note yet'}</p>
                  </div>
                ))}
                <Button variant="secondary" className="w-full" onClick={resetGame}>
                  Start again
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

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
    else if (tab === 'insights') onNavigate?.('memories');
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
          <p className="text-sm text-bae-navy/70">Play games designed to spark connection, curiosity, and laughter.</p>
        </motion.div>

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
