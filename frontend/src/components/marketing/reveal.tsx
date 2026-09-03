'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Play once on mount instead of waiting for scroll into view — used for the hero. */
  immediate?: boolean;
}

/**
 * Fade+rise on scroll into view, once. Respects prefers-reduced-motion by
 * dropping the vertical offset and keeping only the fade — motion never
 * blocks content from appearing for users who've asked for less of it.
 */
export function Reveal({ children, delay = 0, className, immediate = false }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <motion.div
      initial="hidden"
      {...(immediate
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, margin: '-80px' } })}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
