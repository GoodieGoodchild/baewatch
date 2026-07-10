import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Mail, Lock } from 'lucide-react';
import logoMark from '../assets/logo-mark-tight.png';

export const LoginPage = ({ onSwitchToSignup, onExploreDemo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your email above first, then tap "Forgot password?" again.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setInfo('Reset link sent — check your inbox (and spam folder). 💌');
    } catch {
      // Deliberately vague: don't reveal whether an account exists.
      setInfo('If an account exists for that email, a reset link is on its way. 💌');
    }
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
          <motion.img
            src={logoMark}
            alt="Bae Watch"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-24 mx-auto object-contain"
          />
          <h1 className="text-3xl font-bold text-bae-navy">Welcome Back</h1>
          <p className="text-bae-navy/70">Sign in to your relationship</p>
        </div>

        <Card variant="peach">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-bae-navy mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bae-navy/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-bae-navy mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bae-navy/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Your password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {info && (
              <p className="text-green-600 text-sm text-center">{info}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-center text-sm text-bae-navy/60 hover:text-bae-coral transition"
            >
              Forgot password?
            </button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-bae-navy/70">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-bae-coral font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>

        {onExploreDemo && (
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-bae-peach" />
              <span className="text-xs text-bae-navy/40">or</span>
              <div className="flex-1 h-px bg-bae-peach" />
            </div>
            <Button variant="outline" className="w-full" onClick={onExploreDemo}>
              👀 Explore a sample couple
            </Button>
            <p className="text-center text-xs text-bae-navy/40 mt-2">
              See Sam &amp; Maya's journey — one month in, no sign-up needed
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;