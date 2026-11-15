import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 26, once = true }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
}

interface SectionBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionBadge({ children, icon, className = '' }: SectionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-app-accent/20 bg-app-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-app-accent ${className}`}>
      {icon}
      {children}
    </span>
  );
}
