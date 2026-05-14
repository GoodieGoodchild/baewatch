import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  variant = 'light',
  hover = true,
  ...props
}) => {
  const variants = {
    light: 'bg-bae-warm-white border border-bae-peach/30',
    peach: 'bg-bae-light-peach border border-bae-peach/50',
    gradient: 'bg-gradient-to-br from-bae-light-peach to-bae-warm-white border border-bae-peach/40',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      className={`rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
