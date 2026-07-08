import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafetyHeader from '../components/common/SafetyHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isAIConfigured } from '../services/aiService';
import { generateWeatherForecast } from '../services/funService';
import { loveLanguages } from '../services/loveLanguages';

const WEATHER = {
  sunny: { emoji: '☀️', label: 'Sunny', blurb: 'Warm and connected — soak it in.' },
  cloudy: { emoji: '⛅', label: 'Cloudy', blurb: 'A little distance in the air. Nothing a small gesture can\'t clear.' },
  rainy: { emoji: '🌧️', label: 'Rainy', blurb: 'Some heaviness lately. Gentleness goes a long way right now.' },
  stormy: { emoji: '⛈️', label: 'Stormy', blurb: 'Big feelings in the forecast. Shelter each other, don\'t battle each other.' },
};

export const WeatherDetailsPage = ({ onNavigate }) => {
  const { relationshipData } = useApp();
  const profile = relationshipData.profile || {};
  const partnerName = profile.partnerName || 'your partner';
  const weather = WEATHER[relationshipData.weatherMood] || WEATHER.cloudy;
  const connection = relationshipData.connectionLevel ?? 72;
  const cup = profile.cupFullness ?? 72;
  const history = relationshipData.checkInHistory || [];
  const trend = relationshipData.connectionLevelHistory || [];
  const recent = [...history].slice(-5).reverse();
  const showRepair = relationshipData.weatherMood === 'rainy' || relationshipData.weatherMood === 'stormy' || connection < 50;

  const yourLang = loveLanguages[profile.yourLoveLanguage];
  const partnerLang = loveLanguages[profile.partnerLoveLanguage];
  const selfInsight = relationshipData.selfInsight;
  const partnerInsight = relationshipData.partnerInsight;

  const [forecast, setForecast] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const askBae = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      const res = await generateWeatherForecast({
        couple: { profile, selfInsight, partnerInsight },
        weatherMood: relationshipData.weatherMood,
        connectionLevel: connection,
        recentCheckIns: history,
      });
      setForecast(res);
    } catch {
      setAiError('Bae is napping — try again in a moment.');
    }
    setAiBusy(false);
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') onNavigate?.('home');
    else if (tab === 'checkin') onNavigate?.('checkin');
    else if (tab === 'add') onNavigate?.('coach');
    else if (tab === 'memories') onNavigate?.('memories');
    else if (tab === 'games') onNavigate?.('games');
  };

  const stateEmoji = {
    overwhelmed: '😵', disconnected: '😢', anxious: '😰', exhausted: '😴',
    okay: '🙂', reassured: '🤗', affectionate: '😍', loving: '💕',
  };

  return (
    <motion.div className="min-h-screen bg-bae-cream pb-32 pt-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SafetyHeader />

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Current weather hero */}
        <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mt-4">
          <motion.p
            className="text-6xl mb-2"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {weather.emoji}
          </motion.p>
          <h2 className="text-2xl font-bold text-bae-navy">{weather.label} right now</h2>
          <p className="text-sm text-bae-navy/70 mt-1">{weather.blurb}</p>
        </motion.div>

        {/* Vitals */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="light" hover={false} className="text-center !p-4">
            <p className="text-2xl font-bold text-bae-coral">{connection}</p>
            <p className="text-xs text-bae-navy/60">Connection level</p>
          </Card>
          <Card variant="light" hover={false} className="text-center !p-4">
            <p className="text-2xl font-bold text-bae-coral">{cup}%</p>
            <p className="text-xs text-bae-navy/60">Your cup</p>
          </Card>
        </div>

        {/* Bae's forecast */}
        <Card variant="gradient">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔮</span>
            <h3 className="text-base font-bold text-bae-navy">Bae's Forecast</h3>
          </div>
          {forecast ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-sm font-semibold text-bae-navy">{forecast.headline}</p>
              <p className="text-sm text-bae-navy/75">{forecast.forecast}</p>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-xs font-semibold text-bae-coral mb-0.5">TOMORROW'S SUNSHINE TIP</p>
                <p className="text-sm text-bae-navy/80">{forecast.tomorrowTip}</p>
              </div>
              <Button variant="ghost" size="sm" className="w-full" disabled={aiBusy} onClick={askBae}>
                <RefreshCw className={`w-4 h-4 mr-1 ${aiBusy ? 'animate-spin' : ''}`} /> New forecast
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-bae-navy/70">
                Bae reads your recent check-ins and delivers the emotional weather report — with one
                small way to invite sunshine.
              </p>
              {isAIConfigured() ? (
                <Button variant="primary" size="sm" className="w-full" disabled={aiBusy} onClick={askBae}>
                  {aiBusy ? (
                    <span className="flex items-center gap-2 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Reading the skies…</span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4" /> Get today's forecast</span>
                  )}
                </Button>
              ) : (
                <p className="text-xs text-bae-navy/50">Add an AI key to unlock Bae's forecasts.</p>
              )}
              {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
            </div>
          )}
        </Card>

        {showRepair && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate?.('repair')}
            className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-blue-700">💙 Repair Mode</p>
              <p className="text-xs text-blue-600/70 mt-0.5">A guided path back to each other</p>
            </div>
            <span className="text-xs font-semibold text-white bg-blue-500 rounded-xl px-3 py-1.5">Open</span>
          </motion.button>
        )}

        {/* Connection trend */}
        {trend.length >= 2 && (
          <Card variant="light">
            <h3 className="text-sm font-bold text-bae-navy mb-3">📈 Connection trend</h3>
            <div className="flex items-end gap-1 h-20">
              {trend.slice(-14).map((point, i) => (
                <motion.div
                  key={`${point.date}-${i}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, point.value)}%` }}
                  transition={{ delay: i * 0.04 }}
                  className="flex-1 bg-gradient-to-t from-bae-coral to-bae-salmon rounded-t-md min-w-[6px]"
                  title={`${point.date}: ${point.value}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-bae-navy/40 mt-1">
              <span>{trend[Math.max(0, trend.length - 14)].date.slice(5)}</span>
              <span>{trend[trend.length - 1].date.slice(5)}</span>
            </div>
          </Card>
        )}

        {/* What you each need — love language weather gear */}
        {(yourLang || partnerLang) && (
          <Card variant="peach">
            <h3 className="text-sm font-bold text-bae-navy mb-3">🧣 Weather gear for this couple</h3>
            <div className="space-y-2">
              {yourLang && (
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-xs font-semibold text-bae-coral mb-0.5">
                    {profile.yourName ? profile.yourName.toUpperCase() : 'YOU'} · {yourLang.emoji} {yourLang.label}
                  </p>
                  <p className="text-xs text-bae-navy/70">{yourLang.short}</p>
                </div>
              )}
              {partnerLang && (
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-xs font-semibold text-bae-coral mb-0.5">
                    {partnerName.toUpperCase()} · {partnerLang.emoji} {partnerLang.label}
                  </p>
                  <p className="text-xs text-bae-navy/70">{partnerLang.short}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Recent check-ins */}
        <Card variant="light">
          <h3 className="text-sm font-bold text-bae-navy mb-3">🗓️ Recent check-ins</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-bae-navy/60">
              No check-ins yet — your weather history starts with your first one.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((c, i) => (
                <div key={`${c.date}-${i}`} className="flex gap-3 items-start">
                  <span className="text-xl flex-shrink-0">{stateEmoji[c.stateId] || '💭'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bae-navy">
                      {c.moodLabel || c.stateId}
                      <span className="text-xs font-normal text-bae-navy/40 ml-2">{c.date}</span>
                    </p>
                    {c.note && <p className="text-xs text-bae-navy/60 italic mt-0.5">"{c.note}"</p>}
                    {c.needs?.length > 0 && (
                      <p className="text-[11px] text-bae-coral mt-0.5">Needed: {c.needs.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => onNavigate?.('checkin')}>
            <Heart className="w-4 h-4 mr-1" /> Check in now
          </Button>
        </Card>
      </div>

      <BottomNavigation activeTab="weather" onTabChange={handleTabChange} />
    </motion.div>
  );
};

export default WeatherDetailsPage;
