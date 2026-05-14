import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Mail, Lock } from 'lucide-react';

export const LoginPage = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
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
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;