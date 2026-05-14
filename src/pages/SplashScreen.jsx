import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FloatingHearts from '../components/common/FloatingHearts';
import baewatch2 from '../assets/baewatch2.jpeg';

export const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const logoSrc = '/bae-watch-logo.svg';


  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 900);
          return 100;
        }
        return Math.min(100, prev + Math.random() * 10 + 4);
      });
    }, 400);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="relative w-full min-h-screen h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        src={baewatch2}
        alt="Bae Watch loading background"
        className="absolute inset-0 h-screen w-screen object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
      <FloatingHearts count={8} className="absolute inset-0 opacity-30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12">
        <header className="w-full max-w-[90vw] text-center">
          {logoError ? (
            <div className="mx-auto mb-4 rounded-[24px] bg-bae-peach/90 px-6 py-4 text-4xl font-black uppercase tracking-[0.22em] text-bae-navy shadow-xl w-[80vw] max-w-[600px]">
              Bae Watch
            </div>
          ) : (
            <img
              src={logoSrc}
              alt="Bae Watch logo"
              onError={() => setLogoError(true)}
              className="mx-auto mb-4 w-[80vw] max-w-[600px] object-contain"
            />
          )}
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full max-w-3xl rounded-[32px] border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          <div className="space-y-5 p-8 sm:p-10">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-bae-coral">
                loading our connection...
              </p>
              <h1 className="mt-4 text-4xl font-bold text-bae-navy sm:text-5xl">
                Bae Watch
              </h1>
              <p className="mt-3 text-base text-bae-navy/70 sm:text-lg">
                Tip: Small acts, big impact.
              </p>
            </div>

            <div className="rounded-full bg-bae-peach/70 p-1 shadow-inner shadow-bae-deep-coral/10">
              <motion.div
                className="h-4 rounded-full bg-gradient-to-r from-bae-coral to-bae-salmon"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-center text-sm font-medium text-bae-navy/70">
              {progress < 50 ? 'Please wait while we prepare your experience...' : 'Almost ready, just a moment longer.'}
            </p>
          </div>
        </motion.div>

        <div className="w-full max-w-3xl text-center text-sm text-bae-warm-white/80">
          <p className="font-medium">Welcome to your relationship companion.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
