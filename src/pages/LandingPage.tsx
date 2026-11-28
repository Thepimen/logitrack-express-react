import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
  arrowForwardOutline,
  checkmarkCircleOutline,
  cloudDoneOutline,
  cubeOutline,
  layersOutline,
  lockClosedOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  speedometerOutline,
  syncOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

export interface LandingPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

const MORPHING_WORDS: ReadonlyArray<{
  readonly active: string;
  readonly ghost: string;
  readonly tag: string;
}> = [
  { active: 'Trazabilidad', ghost: 'Manual', tag: 'LÍNEA DE CLASIFICACIÓN C1' },
  { active: 'Tiempo Real', ghost: 'Retrasos', tag: 'CONTROL DE BULTOS EN PLANTA' },
  { active: 'Precisión', ghost: 'Errores', tag: 'VERIFICACIÓN ÓPTICA ACTIVA' },
  { active: 'Seguridad', ghost: 'Riesgos', tag: 'IDENTIDAD ÚNICA CERTIFICADA' }
];

const LANDING_SECTIONS: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: 'hero', label: 'Inicio' },
  { id: 'ergonomia', label: 'Ergonomía Visual' },
  { id: 'indicadores', label: 'Indicadores' },
  { id: 'operacion', label: 'Operación Continua' }
];

const STATUS_READABLE: Record<string, string> = {
  IN_TRANSIT: 'En cinta',
  INSPECTED: 'Verificado',
  REJECTED: 'Cuarentena'
};

/**
 * Landing Page a medida de LogiTrack Express (`/`)
 * - Armonía visual completa en modo Claro (Glacier Blue) y modo Oscuro (Midnight Sapphire)
 *   controlada exclusivamente por el usuario (sin cambios automáticos entre secciones).
 * - Lenguaje 100% orientado al cliente logístico (sin menciones técnicas de stack).
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
    <div className="lt-public-page">
      {/* Indicador vertical lateral derecho de progreso por puntos */}
      <nav
        className="lt-landing-dots-rail"
        aria-label="Navegación rápida de secciones de la página de inicio"
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

      {/* Cabecera minimalista limpia compartida con Login y Registro */}
      <header className="lt-public-header">
        <div className="lt-public-header-inner">
          <Link to="/" className="lt-public-brand" aria-label="LogiTrack Express Inicio">
            <span className="lt-public-logo-mark" aria-hidden="true">
              <IonIcon icon={cubeOutline} />
            </span>
            <span className="lt-public-logo-text">LogiTrack</span>
          </Link>

          <nav className="lt-public-top-nav" aria-label="Secciones principales">
            <button
              type="button"
              className="lt-public-nav-anchor"
              onClick={() => scrollToSection('ergonomia')}
            >
              Ergonomía Visual
            </button>
            <button
              type="button"
              className="lt-public-nav-anchor"
              onClick={() => scrollToSection('indicadores')}
            >
              Indicadores
            </button>
            <button
              type="button"
              className="lt-public-nav-anchor"
              onClick={() => scrollToSection('operacion')}
            >
              Sincronización
            </button>
          </nav>

          <div className="lt-public-auth-actions">
            <ThemeToggleButton />
            <Link to="/login" className="lt-public-login-link" data-testid="landing-link-login">
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="lt-public-signup-pill"
              data-testid="landing-link-register"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ================================================================== */}
        {/* SECCIÓN 1: HERO EDITORIAL CON FORMAS AZULES Y TARJETA ELEVADA      */}
        {/* ================================================================== */}
        <section id="hero" className="lt-landing-hero" aria-labelledby="landing-hero-heading">
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
              <span>LOGITRACK EXPRESS · GESTIÓN INTELIGENTE DE CENTROS LOGÍSTICOS</span>
            </div>

            <h1 id="landing-hero-heading" className="lt-landing-title">
              Inspect &amp; Dispatch
            </h1>

            <p className="lt-landing-subtitle">
              Control operativo de recepción, inspección y clasificación de envíos diseñado para máxima claridad visual.
            </p>

            <div className="lt-landing-hero-ctas">
              <Link to="/terminal" className="lt-btn-primary-solid" data-testid="landing-cta-terminal">
                <span>Acceder al Panel</span>
                <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
              </Link>
              <Link to="/register" className="lt-btn-secondary-surface">
                <span>Crear Cuenta de Operario</span>
              </Link>
            </div>
          </div>

          {/* Tarjeta central elevada con vista previa en vivo */}
          <motion.div
            className="lt-hero-elevated-sheet"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24, delay: 0.1 }}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
          >
            <div className="lt-sheet-top-row">
              <span className="lt-sheet-slash" aria-hidden="true" />
              <span className="lt-sheet-live-pill">
                <span className="lt-sheet-pulse-dot" aria-hidden="true" />
                LÍNEA ACTIVA · {metrics.total} ENVÍOS EN SEGUIMIENTO
              </span>
            </div>

            <div className="lt-sheet-client-label">
              Centro Operativo: MAD-Cargo Terminal T4 · {currentMorph.tag}
            </div>

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

            <div className="lt-sheet-skeleton-bars" aria-hidden="true">
              <span className="lt-skel-bar w-85" />
              <span className="lt-skel-bar w-65 lt-skel-accent" />
              <span className="lt-skel-bar w-78" />
            </div>

            <div className="lt-sheet-section-heading">Últimos envíos registrados en línea</div>

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
                      {STATUS_READABLE[pkg.status] ?? pkg.status}
                    </span>
                  </div>
                </GlassyReveal>
              ))}
            </GlassyStagger>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 2: ERGONOMÍA VISUAL (100% FIEL AL TEMA CLARO U OSCURO)     */}
        {/* ================================================================== */}
        <section id="ergonomia" className="lt-public-band" aria-labelledby="ergonomia-heading">
          <div className="lt-landing-container">
            <div className="lt-landing-section-head">
              <span className="lt-kicker-accent">ERGONOMÍA VISUAL Y CONFORT OPERATIVO</span>
              <h2 id="ergonomia-heading" className="lt-public-h2">
                Una gama azul pensada para cuidar tu vista en cada turno
              </h2>
              <p className="lt-public-lead">
                El equilibrio entre tonos azul glaciar, cobalto y zafiro aporta calma cognitiva,
                lectura rápida de etiquetas y adaptación instantánea entre modo diurno y modo nocturno.
              </p>
            </div>

            <div className="lt-palette-grid">
              <motion.article
                className="lt-surface-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip lt-swatch-glacier" />
                <span className="lt-swatch-code">MODO DIURNO SUAVE</span>
                <h3>Descanso Visual</h3>
                <p>Fondos claros atenuados que eliminan reflejos molestos durante jornadas largas en oficina o almacén.</p>
              </motion.article>

              <motion.article
                className="lt-surface-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip lt-swatch-cobalt" />
                <span className="lt-swatch-code">COBALTO DE PRECISIÓN</span>
                <h3>Confianza y Enfoque</h3>
                <p>Destaca acciones principales, botones de clasificación y controles clave con contraste de alta legibilidad.</p>
              </motion.article>

              <motion.article
                className="lt-surface-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip lt-swatch-cerulean" />
                <span className="lt-swatch-code">SEÑALIZACIÓN CLARA</span>
                <h3>Lectura Inmediata</h3>
                <p>Estados diferenciados por color, icono y texto para evitar errores al clasificar envíos urgentes.</p>
              </motion.article>

              <motion.article
                className="lt-surface-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <div className="lt-swatch-chip lt-swatch-sapphire" />
                <span className="lt-swatch-code">MODO NOCTURNO TOTAL</span>
                <h3>Turnos de Baja Luz</h3>
                <p>Cambia toda la plataforma a modo oscuro con un clic cuando trabajes en naves con iluminación reducida.</p>
              </motion.article>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 3: INDICADORES EN CASCADA (RESPETA TEMA CLARO / OSCURO)    */}
        {/* ================================================================== */}
        <section
          id="indicadores"
          className="lt-public-band lt-public-band-alt"
          aria-labelledby="indicadores-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-section-head lt-head-split-row">
              <div>
                <span className="lt-kicker-accent">VISIÓN GLOBAL AL INSTANTE</span>
                <h2 id="indicadores-heading" className="lt-public-h2">
                  Todos los datos de tu planta en una sola mirada
                </h2>
              </div>
              <button
                type="button"
                className="lt-btn-secondary-surface"
                onClick={() => setReplayKey((k) => k + 1)}
              >
                <IonIcon icon={refreshOutline} aria-hidden="true" />
                <span>Actualizar vista</span>
              </button>
            </div>

            <GlassyStagger className="lt-bento-overview-grid" replayKey={replayKey}>
              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={speedometerOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">ENVÍOS EN PLANTA</span>
                <strong className="lt-bento-big lt-tabular-nums">{metrics.total}</strong>
                <p>Control sincronizado en tiempo real con {metrics.totalWeightKg.toFixed(1)} kg en línea.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">ACCESIBILIDAD CERTIFICADA</span>
                <strong className="lt-bento-big lt-tabular-nums">100 / 100</strong>
                <p>Navegación completa por teclado, lectura asistida y contraste óptimo en modo claro y oscuro.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={layersOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">CLASIFICACIÓN ACTIVA</span>
                <strong className="lt-bento-big lt-tabular-nums">{metrics.inspectionRatePercent}%</strong>
                <p>Flujo ágil por páginas para revisar, aprobar o desviar envíos sin desplazamientos interminables.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">IDENTIDAD SEGURA</span>
                <strong className="lt-bento-big lt-tabular-nums">128 bits</strong>
                <p>Cada envío dispone de un identificador irrepetible que garantiza trazabilidad entre centros.</p>
              </GlassyReveal>
            </GlassyStagger>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECCIÓN 4: OPERACIÓN CONTINUA Y LLAMADA A LA ACCIÓN                */}
        {/* ================================================================== */}
        <section id="operacion" className="lt-public-band" aria-labelledby="operacion-heading">
          <div className="lt-landing-container">
            <div className="lt-landing-two-col">
              <GlassyReveal className="lt-surface-card lt-feature-panel" hoverLift>
                <span className="lt-kicker-accent">RESPALDO Y CONTINUIDAD</span>
                <h2 id="operacion-heading" className="lt-public-h3">
                  <IonIcon icon={cloudDoneOutline} aria-hidden="true" /> Persistencia en la Nube y Registro Histórico
                </h2>
                <p className="lt-public-p">
                  Cada movimiento en la cinta se guarda de forma segura en la base de datos central,
                  generando copias de respaldo automáticas, manifiestos descargables y trazabilidad
                  completa de cada turno.
                </p>
                <Link to="/cloud-infra" className="lt-inline-action-link">
                  <span>Ver Centro de Sincronización</span>
                  <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
                </Link>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-feature-panel" hoverLift>
                <span className="lt-kicker-accent">ACTUALIZACIÓN AUTOMATIZADA</span>
                <h2 className="lt-public-h3">
                  <IonIcon icon={syncOutline} aria-hidden="true" /> Control de Calidad y Alta Disponibilidad
                </h2>
                <p className="lt-public-p">
                  La plataforma cuenta con verificaciones automáticas de integridad, pruebas de servicio
                  y publicación continua sin cortes para mantener el centro operativo las 24 horas.
                </p>
                <div className="lt-status-chips-row" aria-label="Garantías de servicio">
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Verificación automática</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Respaldo en vivo</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Servicio 24/7</span>
                </div>
              </GlassyReveal>
            </div>

            <div className="lt-public-final-cta">
              <div>
                <h3>Empieza a gestionar tu línea de envíos ahora</h3>
                <p>Inicia sesión con tu placa de operario o crea una cuenta nueva en menos de un minuto.</p>
              </div>
              <div className="lt-landing-final-buttons">
                <Link to="/login" className="lt-btn-secondary-surface">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="lt-btn-primary-solid">
                  <span>Crear cuenta</span>
                  <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lt-public-footer">
        <div className="lt-landing-container lt-landing-footer-inner">
          <span>
            <strong>LogiTrack Express</strong> · Plataforma Integral de Control y Clasificación Logística
          </span>
          <span>Centros Operativos MAD-HUB-01 · BCN-ZAL · VLC-Puerto · Atención 24/7</span>
        </div>
      </footer>
    </div>
  );
};
