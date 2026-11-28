import React from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * ============================================================================
 * LOGITRACK EXPRESS v4.1 — MOTOR DE ANIMACIONES SUAVES Y SELECTIVAS
 * ============================================================================
 * Conserva la fluidez visual de v4.0 pero con desplazamientos cortos y controlados
 * (8 px en lugar de saltos bruscos de 22 px, elevación sutil de -2 px al hover),
 * respetando siempre `prefers-reduced-motion` mediante `<MotionConfig reducedMotion="user">`.
 */

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const glassyContainerVariants: Variants = {
  hidden: {
    opacity: 0.96
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.03,
      staggerChildren: 0.055
    }
  }
};

export const glassyItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.992
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: SMOOTH_EASE
    }
  }
};

export interface GlassyStaggerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly replayKey?: number;
  readonly ariaLabel?: string;
}

export const GlassyStagger: React.FC<GlassyStaggerProps> = ({
  children,
  className = '',
  replayKey = 0,
  ariaLabel
}) => {
  return (
    <motion.div
      key={replayKey}
      className={className}
      variants={glassyContainerVariants}
      initial="hidden"
      animate="visible"
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
};

export interface GlassyRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly hoverLift?: boolean;
  readonly shimmer?: boolean;
  readonly indexDelay?: number;
}

export const GlassyReveal: React.FC<GlassyRevealProps> = ({
  children,
  className = '',
  hoverLift = false,
  shimmer = true,
  indexDelay
}) => {
  const customTransition =
    typeof indexDelay === 'number'
      ? {
          duration: 0.38,
          ease: SMOOTH_EASE,
          delay: indexDelay
        }
      : undefined;

  return (
    <motion.div
      className={`${className} ${shimmer ? 'lt-glass-sheen' : ''}`.trim()}
      variants={customTransition ? undefined : glassyItemVariants}
      initial={customTransition ? { opacity: 0, y: 8, scale: 0.992 } : undefined}
      animate={customTransition ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={customTransition}
      whileHover={
        hoverLift
          ? {
              y: -2,
              transition: { duration: 0.18, ease: 'easeOut' }
            }
          : undefined
      }
      whileTap={hoverLift ? { scale: 0.994 } : undefined}
    >
      {children}
    </motion.div>
  );
};
