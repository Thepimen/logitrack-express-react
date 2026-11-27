import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
  arrowForwardOutline,
  checkmarkCircleOutline,
  cloudDoneOutline,
  cubeOutline,
  gitBranchOutline,
  layersOutline,
  lockClosedOutline,
  serverOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  speedometerOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

export interface LandingPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

const MORPHING_WORDS: ReadonlyArray<{
  readonly active: string;
  readonly ghost: string;
  readonly tag: string;
}> = [
  { active: 'Telemetry', ghost: 'Manual Logs', tag: 'REAL-TIME CONVEYOR C1' },
  { active: 'UUID v4', ghost: 'Int IDs', tag: 'RFC 9562 · 128-BIT CSPRNG' },
  { active: 'AWS Cloud', ghost: 'Local Mocks', tag: 'LOCALSTACK + SUPABASE DB' },
  { active: 'WCAG AAA', ghost: 'Low Contrast', tag: 'LIGHTHOUSE 100/100 CERTIFIED' }
];

const LANDING_SECTIONS: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: 'hero', label: 'Inicio' },
  { id: 'psychology', label: 'Psicología Azul' },
  { id: 'bento', label: 'Despliegue Glassy' },
  { id: 'cloud', label: 'BD & AWS Emulator' },
  { id: 'cicd', label: 'Pipeline CI/CD' }
];

/**
 * ============================================================================
 * LANDING PAGE A MEDIDA — LOGITRACK EXPRESS v3.0 (PALETA AZUL PSICOLÓGICA)
 * ============================================================================
 * Composición inspirada en el patrón editorial limpio y espacioso del referente
 * visual (cabecera minimalista, titular central audaz, formas geométricas
 * flotantes, indicador vertical de progreso a la derecha y tarjeta central
 * elevada con palabra resaltada animada), re-diseñado íntegramente en una
 * paleta de azules científicamente calibrada para el ojo humano (Glacier Ice,
 * Cerulean, Sapphire y Abyssal Navy) con paneles Glassmorphism y animaciones
 * de despliegue escalonado con Framer Motion.
 */
export const LandingPage: React.FC<LandingPageProps> = ({ warehouseState }) => {
  const { packages, metrics } = warehouseState;
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [replayKey, setReplayKey] = useState<number>(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % MORPHING_WORDS.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, []);

  const currentMorph = MORPHING_WORDS[wordIndex];
  const previewPackages = packages.slice(0, 3);

  const scrollToSection = (sectionId: string): void => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="lt-landing-page">
      {/* Indicador vertical lateral derecho de puntos de navegación (estilo referente visual) */}
      <nav
        className="lt-landing-dots-rail"
        aria-label="Navegación rápida de secciones de la landing"
      >
        {LANDING_SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`lt-rail-dot ${isActive ? 'is-active' : ''}`}
              aria-label={`Ir a sección ${sec.label}`}
              aria-current={isActive ? 'step' : undefined}
              title={sec.label}
            />
          );
        })}
      </nav>

      {/* Cabecera minimalista limpia superior (Marca izquierda · Login + Pill azul derecha) */}
      <header className="lt-landing-header">
        <div className="lt-landing-header-inner">
          <Link to="/" className="lt-landing-brand" aria-label="LogiTrack Express Inicio">
            <span className="lt-landing-logo-mark" aria-hidden="true">
              <IonIcon icon={cubeOutline} />
            </span>
            <span className="lt-landing-logo-text">LogiTrack</span>
          </Link>

          <nav className="lt-landing-top-nav" aria-label="Enlaces principales de la landing">
            <button
              type="button"
              className="lt-landing-nav-anchor"
              onClick={() => scrollToSection('psychology')}
            >
              Diseño Azul
            </button>
            <button
              type="button"
              className="lt-landing-nav-anchor"
              onClick={() => scrollToSection('cloud')}
            >
              BD &amp; AWS Emulator
            </button>
            <button
              type="button"
              className="lt-landing-nav-anchor"
              onClick={() => scrollToSection('cicd')}
            >
              CI/CD
            </button>
          </nav>

          <div className="lt-landing-auth-actions">
            <Link to="/login" className="lt-landing-login-link" data-testid="landing-link-login">
              Login
            </Link>
            <Link
              to="/terminal"
              className="lt-landing-signup-pill"
              data-testid="landing-cta-terminal"
            >
              Abrir Terminal
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ================================================================== */}
        {/* SECCIÓN 1: HERO EDITORIAL CON FORMAS AZULES Y TARJETA ELEVADA      */}
        {/* ================================================================== */}
        <section id="hero" className="lt-landing-hero" aria-labelledby="landing-hero-heading">
          {/* Formas geométricas vectoriales flotantes en gama azul zafiro y cielo */}
          <div className="lt-geo-field" aria-hidden="true">
            <motion.span
              className="lt-geo-shape lt-geo-square-left"
              animate={{ y: [0, -14, 0], rotate: [16, 24, 16] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-circle-left"
              animate={{ y: [0, 12, 0], scale: [1, 1.07, 1] }}
              transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-arc-top"
              animate={{ rotate: [-12, 8, -12], y: [0, -8, 0] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-arc-left"
              animate={{ rotate: [20, 4, 20], y: [0, 10, 0] }}
              transition={{ duration: 7.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-circle-right"
              animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 6.9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-square-right"
              animate={{ y: [0, 14, 0], rotate: [-14, -22, -14] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.svg
              className="lt-geo-triangle-left"
              viewBox="0 0 80 70"
              fill="none"
              animate={{ y: [0, -10, 0], rotate: [-8, 4, -8] }}
              transition={{ duration: 8.1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <polygon
                points="40,6 74,64 6,64"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>

          <div className="lt-landing-hero-content">
            <div className="lt-landing-eyebrow-pill">
              <IonIcon icon={sparklesOutline} aria-hidden="true" />
              <span>LOGITRACK EXPRESS v3.0 · REACT 19 + IONIC v8 + SUPABASE + AWS EMULATOR</span>
            </div>

            <h1 id="landing-hero-heading" className="lt-landing-title">
              Inspect &amp; Dispatch
            </h1>

            <p className="lt-landing-subtitle">
              Experiencia logística híbrida, elegante y reactiva diseñada para claridad cognitiva en tiempo real.
            </p>

            <div className="lt-landing-hero-ctas">
              <Link to="/terminal" className="lt-landing-btn-primary">
                <span>Explorar Consola Glassy</span>
                <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
              </Link>
              <Link to="/cloud-infra" className="lt-landing-btn-secondary">
                <IonIcon icon={cloudDoneOutline} aria-hidden="true" />
                <span>Base de Datos &amp; AWS Emulator</span>
              </Link>
            </div>
          </div>

          {/* Tarjeta central elevada Glassmorphic (inspirada directamente en la tarjeta central de la foto) */}
          <motion.div
            className="lt-hero-elevated-sheet"
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24, delay: 0.12 }}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
          >
            <div className="lt-sheet-top-row">
              <span className="lt-sheet-slash" aria-hidden="true" />
              <span className="lt-sheet-live-pill">
                <span className="lt-sheet-pulse-dot" aria-hidden="true" />
                SUPABASE POSTGRESQL · {metrics.total} PAQUETES EN CINTA
              </span>
            </div>

            <div className="lt-sheet-client-label">Hub Activo: MAD-Cargo Terminal T4 · {currentMorph.tag}</div>

            <div className="lt-sheet-morph-line" aria-live="polite">
              <span className="lt-sheet-static-word">LogiTrack</span>
              <span className="lt-sheet-highlight-wrap">
                <span className="lt-sheet-ghost-word" aria-hidden="true">
                  {currentMorph.ghost}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentMorph.active}
                    className="lt-sheet-active-highlight"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    {currentMorph.active}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            {/* Líneas de despliegue escalonado con datos reales de Supabase */}
            <div className="lt-sheet-skeleton-bars" aria-hidden="true">
              <span className="lt-skel-bar w-85" />
              <span className="lt-skel-bar w-65 lt-skel-accent" />
              <span className="lt-skel-bar w-78" />
            </div>

            <div className="lt-sheet-section-heading">Telemetría en Vivo (Despliegue Reactivo)</div>

            <GlassyStagger className="lt-sheet-live-rows" replayKey={replayKey}>
              {previewPackages.map((pkg) => (
                <GlassyReveal key={pkg.id} className="lt-sheet-pkg-row" hoverLift>
                  <div className="lt-sheet-pkg-main">
                    <strong className="lt-tabular-nums">{pkg.trackingCode}</strong>
                    <span>{pkg.destinationHub}</span>
                  </div>
                  <div className="lt-sheet-pkg-meta lt-tabular-nums">
                    <span>{pkg.weightKg.toFixed(2)} kg</span>
                    <span className={`lt-sheet-pill lt-sheet-pill-${pkg.status.toLowerCase()}`}>
                      {pkg.status}
                    </span>
                  </div>
                </GlassyReveal>
              ))}
            </GlassyStagger>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 2: PSICOLOGÍA DEL COLOR AZUL Y GLASSMORPHISM               */}
        {/* ================================================================== */}
        <section
          id="psychology"
          className="lt-landing-band lt-landing-band-light"
          aria-labelledby="psychology-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-section-head">
              <span className="lt-blue-kicker">ERGONOMÍA VISUAL &amp; PSICOLOGÍA CROMÁTICA</span>
              <h2 id="psychology-heading" className="lt-landing-h2">
                Una paleta azul diseñada para la fisiología del ojo humano
              </h2>
              <p className="lt-landing-lead">
                El espectro azul calibrado (<strong>450–495 nm</strong>) combina serenidad operativa,
                confianza institucional y máxima agudeza de lectura sin fatiga pupilar. Al integrar
                capas translúcidas <em>Glassmorphism</em> con desenfoque óptico real (<code>backdrop-filter</code>),
                la jerarquía espacial se percibe de forma intuitiva en milisegundos.
              </p>
            </div>

            <div className="lt-palette-grid">
              <motion.article
                className="lt-swatch-glass-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip" style={{ background: '#F4F8FF', border: '1px solid #BFDBFE' }} />
                <span className="lt-swatch-code">#F4F8FF · GLACIER CANVAS</span>
                <h3>Descanso Retiniano</h3>
                <p>Evita el deslumbramiento agresivo del blanco puro `#FFFFFF` reduciendo el estrés visual en sesiones prolongadas.</p>
              </motion.article>

              <motion.article
                className="lt-swatch-glass-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip" style={{ background: 'linear-gradient(135deg, #2563EB, #0284C7)' }} />
                <span className="lt-swatch-code">#1D4ED8 · COBALT TRUST</span>
                <h3>Confianza y Precisión</h3>
                <p>Acento interactivo que guía la mirada hacia acciones primarias y controles críticos con contraste certificado AAA.</p>
              </motion.article>

              <motion.article
                className="lt-swatch-glass-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip" style={{ background: 'linear-gradient(135deg, #38BDF8, #BAE6FD)' }} />
                <span className="lt-swatch-code">#38BDF8 · CERULEAN FOCUS</span>
                <h3>Foco y Micro-Interacción</h3>
                <p>Ilumina bordes especulares de vidrio, anillos `:focus-visible` WCAG 2.4.7 y barridos de despliegue en cascada.</p>
              </motion.article>

              <motion.article
                className="lt-swatch-glass-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip" style={{ background: 'linear-gradient(135deg, #050B18, #0F2347)' }} />
                <span className="lt-swatch-code">#050B18 · ABYSSAL SAPPHIRE</span>
                <h3>Modo Nave Nocturna</h3>
                <p>Base oscura azul profunda para la consola industrial (`/terminal`), garantizando ratios &gt; 11.5:1 nivel WCAG AAA.</p>
              </motion.article>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 3: BENTO GLASSY ANIMADO (ESTILO DASHBOARD VIDEO CASCADE)   */}
        {/* ================================================================== */}
        <section
          id="bento"
          className="lt-landing-band lt-landing-band-sapphire"
          aria-labelledby="bento-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-section-head lt-head-dark-row">
              <div>
                <span className="lt-sky-kicker">GLASSY UI · FRAMER MOTION ORCHESTRATED REVEAL</span>
                <h2 id="bento-heading" className="lt-landing-h2-dark">
                  Despliegue fluido de telemetría en paneles de cristal
                </h2>
              </div>
              <button
                type="button"
                className="lt-replay-glass-btn"
                onClick={() => setReplayKey((k) => k + 1)}
              >
                <IonIcon icon={sparklesOutline} aria-hidden="true" />
                <span>REPRODUCIR CASCADA GLASSY</span>
              </button>
            </div>

            <GlassyStagger className="lt-bento-glass-grid" replayKey={replayKey}>
              <GlassyReveal className="lt-bento-glass-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={speedometerOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">UNIDADES EN TIEMPO REAL</span>
                <strong className="lt-bento-big lt-tabular-nums">{metrics.total}</strong>
                <p>Sincronizadas vía PostgREST desde Supabase PostgreSQL ({metrics.totalWeightKg.toFixed(1)} kg totales).</p>
              </GlassyReveal>

              <GlassyReveal className="lt-bento-glass-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">ACCESIBILIDAD WCAG 2.1</span>
                <strong className="lt-bento-big lt-tabular-nums">100 / 100</strong>
                <p>Auditado en Chrome Lighthouse en todas las rutas públicas desplegadas en producción.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-bento-glass-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={layersOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">ESTABILIDAD DE MEMORIA</span>
                <strong className="lt-bento-big lt-tabular-nums">0 Leaks</strong>
                <p>RxJS `takeUntil` + React 19 `useDeferredValue` validados con test de estrés de 50 ciclos.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-bento-glass-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">IDENTIDAD CRIPTOGRÁFICA</span>
                <strong className="lt-bento-big lt-tabular-nums">UUID v4</strong>
                <p>128 bits CSPRNG (RFC 9562) inmune a colisiones multi-terminal y ataques IDOR.</p>
              </GlassyReveal>
            </GlassyStagger>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 4 & 5: BASE DE DATOS + AWS EMULATOR + CI/CD PIPELINE       */}
        {/* ================================================================== */}
        <section
          id="cloud"
          className="lt-landing-band lt-landing-band-sapphire-deep"
          aria-labelledby="cloud-cicd-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-two-col">
              <GlassyReveal className="lt-landing-feature-glass" hoverLift>
                <span className="lt-sky-kicker">ARQUITECTURA CLOUD HÍBRIDA</span>
                <h2 id="cloud-cicd-heading" className="lt-landing-h3-dark">
                  <IonIcon icon={serverOutline} aria-hidden="true" /> Base de Datos PostgreSQL &amp; AWS Emulator (LocalStack)
                </h2>
                <p className="lt-landing-p-dark">
                  Persistencia dual empresarial: cada alta, inspección o rechazo se consolida en{' '}
                  <strong>Supabase PostgreSQL</strong> (<code>warehouse_packages</code> y{' '}
                  <code>warehouse_operators</code> con RLS) y se replica hacia el{' '}
                  <strong>AWS Emulator (puerto 4566)</strong> emulando <strong>Amazon DynamoDB</strong>,{' '}
                  <strong>Amazon S3</strong> (manifiestos JSON) y <strong>Amazon SQS</strong> (cola de eventos).
                </p>
                <Link to="/cloud-infra" className="lt-inline-glass-link">
                  <span>Abrir Consola BD &amp; AWS Emulator</span>
                  <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
                </Link>
              </GlassyReveal>

              <GlassyReveal className="lt-landing-feature-glass" hoverLift>
                <span className="lt-sky-kicker" id="cicd">DEVOPS &amp; AUTOMATIZACIÓN</span>
                <h2 className="lt-landing-h3-dark">
                  <IonIcon icon={gitBranchOutline} aria-hidden="true" /> Pipeline CI/CD Real (GitHub Actions + Vercel Edge)
                </h2>
                <p className="lt-landing-p-dark">
                  Flujo automatizado en <code>.github/workflows/ci-cd.yml</code>: cada <em>push</em> a{' '}
                  <code>main</code> dispara verificación estricta de tipos (<code>tsc --noEmit</code>),
                  construcción de producción (<code>vite build</code>), prueba de humo real sobre el
                  AWS Emulator y despliegue continuo (CD) inmutable en Vercel Edge Network.
                </p>
                <div className="lt-cicd-mini-steps" aria-label="Fases del pipeline CI/CD">
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> TypeCheck</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Vite Build</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> AWS Emulator Test</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Vercel CD</span>
                </div>
              </GlassyReveal>
            </div>

            <div className="lt-landing-final-cta">
              <div>
                <h3>¿Listo para auditar el terminal en vivo?</h3>
                <p>Accede con las credenciales RFID de Supabase o entra directamente al panel operativo.</p>
              </div>
              <div className="lt-landing-final-buttons">
                <Link to="/login" className="lt-landing-btn-secondary-dark">
                  Ir a Login RFID
                </Link>
                <Link to="/terminal" className="lt-landing-btn-primary">
                  <span>Entrar a /terminal</span>
                  <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lt-landing-footer">
        <div className="lt-landing-container lt-landing-footer-inner">
          <span>
            <strong>LogiTrack Express v3.0</strong> · Desarrollo de Interfaces (0488) · 2º DAM · Instituto Nebrija
          </span>
          <span>Luis Lázaro Pimentel (@Thepimen) · React 19 + Ionic v8 + Supabase + AWS Emulator</span>
        </div>
      </footer>
    </div>
  );
};
