import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-full transition-all duration-200 active:scale-95 focus:outline-none';
  
  const variants = {
    primary: 'bg-bae-coral text-white shadow-lg hover:shadow-xl hover:bg-bae-deep-coral',
    secondary: 'bg-bae-peach text-bae-navy shadow-md hover:shadow-lg hover:bg-bae-salmon',
    ghost: 'text-bae-coral hover:bg-bae-cream active:bg-bae-peach',
    outline: 'border-2 border-bae-coral text-bae-coral hover:bg-bae-light-peach',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
