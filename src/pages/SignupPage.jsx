import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Heart, Mail, Lock, User } from 'lucide-react';

export const SignupPage = ({ initialInviteCode, onSwitchToLogin, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signup(formData.email, formData.password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        createdAt: new Date(),
        partnerStatus: 'unpaired',
      });
      onSignupSuccess?.();
    } catch (err) {
      const message = err?.message || err?.code || 'Failed to create account. Try again.';
      setError(message);
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
          <h1 className="text-3xl font-bold text-bae-navy">Join Bae Watch</h1>
          <p className="text-bae-navy/70">Start your relationship journey</p>
        </div>

        <Card variant="peach">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-bae-navy mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bae-navy/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-bae-navy mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bae-navy/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-bae-navy mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bae-navy/40" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-bae-peach bg-white placeholder-bae-navy/40 focus:outline-none focus:ring-2 focus:ring-bae-coral"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {initialInviteCode && (
              <p className="text-sm text-bae-navy/60 text-center">
                You were invited with code <span className="font-semibold text-bae-navy">{initialInviteCode}</span>. After signup you’ll be taken to connect with your partner.
              </p>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-bae-navy/70">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-bae-coral font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignupPage;