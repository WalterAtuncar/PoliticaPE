import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
}) => {
  const baseClasses = glass
    ? 'backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30'
    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      className={`
        ${baseClasses}
        rounded-xl shadow-lg transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};