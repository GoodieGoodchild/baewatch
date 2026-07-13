import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  variant = 'light',
  hover, // default: only lift when the card is actually tappable (has onClick)
  ...props
}) => {
  const variants = {
    light: 'bg-bae-warm-white border border-bae-peach/30',
    peach: 'bg-bae-light-peach border border-bae-peach/50',
    gradient: 'bg-gradient-to-br from-bae-light-peach to-bae-warm-white border border-bae-peach/40',
  };

  // A card should only "lift" on hover if tapping it does something — otherwise
  // it falsely advertises interactivity. Honour an explicit `hover` prop if set.
  const isInteractive = hover !== undefined ? hover : Boolean(props.onClick);

  return (
    <motion.div
      whileHover={isInteractive ? { y: -4 } : {}}
      whileTap={isInteractive ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      className={`rounded-3xl p-6 shadow-md transition-shadow duration-200 ${isInteractive ? 'hover:shadow-lg cursor-pointer' : ''} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
