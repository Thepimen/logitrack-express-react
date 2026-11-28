import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Barra superior fina de carga progresiva que refleja momentos vivos de
 * sincronización y despliegue de datos (0% -> 40% -> 82% -> 100%).
 */
export interface TopLoadingProgressBarProps {
  readonly triggerKey: number;
  readonly isBusy?: boolean;
  readonly label?: string;
}

export const TopLoadingProgressBar: React.FC<TopLoadingProgressBarProps> = ({
  triggerKey,
  isBusy = false,
  label = 'Sincronizando datos de línea'
}) => {
  const [progress, setProgress] = useState<number>(18);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    setVisible(true);
    setProgress(18);

    const t1 = window.setTimeout(() => setProgress(54), 120);
    const t2 = window.setTimeout(() => setProgress(isBusy ? 82 : 86), 300);
    const t3 = window.setTimeout(() => {
      if (!isBusy) setProgress(100);
    }, 520);
    const t4 = window.setTimeout(() => {
      if (!isBusy) setVisible(false);
    }, 880);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [triggerKey, isBusy]);

  return (
    <div className={`lt-live-progress-shell ${visible ? 'is-active' : 'is-settled'}`} aria-hidden={!visible}>
      <div className="lt-live-progress-meta">
        <span className="lt-live-progress-label">
          {progress < 100 ? label : 'Datos sincronizados y listos'}
        </span>
        <span className="lt-live-progress-pct lt-tabular-nums">{progress}%</span>
      </div>
      <div className="lt-live-progress-track">
        <motion.div
          className="lt-live-progress-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.28, ease: SMOOTH_EASE }}
        />
      </div>
    </div>
  );
};

/**
 * Contador numérico animado suavemente desde 0 hasta el valor objetivo.
 */
export interface AnimatedMetricNumberProps {
  readonly value: number;
  readonly suffix?: string;
  readonly replayKey?: number;
  readonly durationMs?: number;
}

export const AnimatedMetricNumber: React.FC<AnimatedMetricNumberProps> = ({
  value,
  suffix = '',
  replayKey = 0,
  durationMs = 560
}) => {
  const [displayVal, setDisplayVal] = useState<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayVal(value);
      return;
    }

    const startVal = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplayVal(Math.round(startVal + (value - startVal) * eased));
      if (ratio < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, replayKey, durationMs]);

  return (
    <>
      {displayVal}
      {suffix}
    </>
  );
};

/**
 * Barra de progreso horizontal que se llena progresivamente con ligero barrido luminoso.
 */
export interface AnimatedProgressBarProps {
  readonly targetPct: number;
  readonly tone: string;
  readonly delay?: number;
  readonly replayKey?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  targetPct,
  tone,
  delay = 0,
  replayKey = 0
}) => {
  const clamped = Math.max(8, Math.min(100, targetPct));

  return (
    <div className="lt-bar-track" aria-hidden="true">
      <motion.div
        key={`${tone}-${replayKey}`}
        className={`lt-bar-fill lt-bar-${tone} lt-bar-animated`}
        initial={{ width: '0%' }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.78, delay, ease: SMOOTH_EASE }}
      />
    </div>
  );
};

/**
 * Anillo SVG Donut que traza su arco progresivamente desde 0% hasta el porcentaje actual.
 */
export interface AnimatedDonutRingProps {
  readonly percent: number;
  readonly radius?: number;
  readonly replayKey?: number;
}

export const AnimatedDonutRing: React.FC<AnimatedDonutRingProps> = ({
  percent,
  radius = 42,
  replayKey = 0
}) => {
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="lt-donut-ring-box">
      <svg viewBox="0 0 100 100" className="lt-donut-svg" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} className="lt-donut-track" />
        <motion.circle
          key={`donut-${replayKey}`}
          cx="50"
          cy="50"
          r={radius}
          className="lt-donut-fill"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 0.85, delay: 0.12, ease: SMOOTH_EASE }}
        />
      </svg>
      <div className="lt-donut-center lt-tabular-nums">
        <strong>
          <AnimatedMetricNumber value={percent} suffix="%" replayKey={replayKey} durationMs={650} />
        </strong>
        <span>Gestionado</span>
      </div>
    </div>
  );
};

/**
 * Mini curva Sparkline SVG que se dibuja progresivamente al entrar o actualizar.
 */
export interface AnimatedSparklineProps {
  readonly d: string;
  readonly colorClass: string;
  readonly delay?: number;
  readonly replayKey?: number;
}

export const AnimatedSparkline: React.FC<AnimatedSparklineProps> = ({
  d,
  colorClass,
  delay = 0.08,
  replayKey = 0
}) => {
  return (
    <svg className={`lt-spark-svg ${colorClass}`} viewBox="0 0 88 38" aria-hidden="true">
      <motion.path
        key={`spark-${replayKey}`}
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.72, delay, ease: SMOOTH_EASE }}
      />
    </svg>
  );
};
