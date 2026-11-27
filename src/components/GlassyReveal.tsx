import React from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * ============================================================================
 * LOGITRACK EXPRESS v3.0 — MOTOR DE ANIMACIONES GLASSY (FRAMER MOTION)
 * ============================================================================
 * Inspirado en el patrón coreografiado de despliegue de paneles (Dashboard V22):
 * - Orquestación escalonada (`staggerChildren`) que despliega KPIs, paneles de
 *   vidrio esmerilado (`backdrop-filter: blur`), tarjetas de paquetes y telemetría
 *   con física de resorte (`spring`) acelerada por GPU (transform + opacity).
 * - Micro-interacción táctil `whileHover={{ y: -5 }}` y `whileTap={{ scale: 0.98 }}`.
 * - Respeta automáticamente `prefers-reduced-motion` mediante `<MotionConfig reducedMotion="user">`.
 */

export const glassyContainerVariants: Variants = {
  hidden: {
    opacity: 0.01
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.065
    }
  }
};

export const glassyItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 24,
      mass: 0.85
    }
  }
};

export interface GlassyStaggerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly replayKey?: number;
  readonly ariaLabel?: string;
}

/**
 * Contenedor orquestador que despliega todos sus hijos en cascada fluida
 * cuando se monta la página o cuando el usuario pulsa "REPRODUCIR DESPLIEGUE".
 */
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

/**
 * Panel individual con entrada escalonada de vidrio esmerilado y barrido de luz diagonal
 * + elevación elástica `whileHover={{ y: -5 }}` acelerada por GPU.
 */
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
          type: 'spring' as const,
          stiffness: 250,
          damping: 24,
          delay: indexDelay
        }
      : undefined;

  return (
    <motion.div
      className={`${className} ${shimmer ? 'lt-glass-sheen' : ''}`.trim()}
      variants={customTransition ? undefined : glassyItemVariants}
      initial={customTransition ? { opacity: 0, y: 20, scale: 0.97 } : undefined}
      animate={customTransition ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={customTransition}
      whileHover={
        hoverLift
          ? {
              y: -5,
              transition: { type: 'spring', stiffness: 360, damping: 24 }
            }
          : undefined
      }
      whileTap={hoverLift ? { scale: 0.985 } : undefined}
    >
      {children}
    </motion.div>
  );
};
