import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const FloatingHearts = ({ count = 10, className = '' }) => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const newHearts = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 3 + Math.random() * 2,
    }));
    setHearts(newHearts);
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -500,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{ left: `${heart.left}%`, bottom: 0 }}
        >
          <Heart className="w-4 h-4 text-bae-coral fill-bae-coral" />
        </motion.div>
      ))}
    </div>
  );
};

export const FloatingSparkles = ({ count = 15 }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }));
    setSparkles(newSparkles);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute"
          style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%` }}
        >
          <span className="text-lg">✨</span>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
