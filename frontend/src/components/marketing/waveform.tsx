'use client';

import { motion, useReducedMotion } from 'framer-motion';

const BAR_COUNT = 24;

/**
 * Ambient animated waveform — reinforces "speaking practice" visually without
 * a stock illustration. Bars pulse at slightly different phases so it reads as
 * organic audio rather than a mechanical loop. Static (no animation) when the
 * viewer has requested reduced motion.
 */
export function Waveform({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <div className="flex items-end justify-center gap-[3px] h-full">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const base = 0.25 + Math.abs(Math.sin(i * 0.7)) * 0.75;
          return (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-primary to-accent-warm"
              style={{ height: `${base * 100}%` }}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      scaleY: [base, base * 0.4 + 0.3, base],
                    }
              }
              transition={{
                duration: 1.4 + (i % 5) * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.04,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
