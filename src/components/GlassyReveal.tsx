import React from 'react';
import { motion } from 'framer-motion';

/**
 * Contenedores estructurales sin fundidos al hacer scroll.
 * Todo el contenido se muestra inmediatamente visible con respuesta táctil limpia.
 */

export interface GlassyStaggerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly replayKey?: number;
  readonly ariaLabel?: string;
}

export const GlassyStagger: React.FC<GlassyStaggerProps> = ({
  children,
  className = '',
  ariaLabel
}) => {
  return (
    <div className={className} aria-label={ariaLabel}>
      {children}
    </div>
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
  hoverLift = false
}) => {
  if (!hoverLift) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -2, transition: { duration: 0.16, ease: 'easeOut' } }}
    >
      {children}
    </motion.div>
  );
};
