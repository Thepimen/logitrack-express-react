import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  cloudDoneOutline,
  layersOutline,
  lockClosedOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  syncOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';
import { AnimatedMetricNumber } from '../components/LiveProgressWidgets';

export interface LandingPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

const MORPHING_WORDS: ReadonlyArray<{
  readonly active: string;
  readonly ghost: string;
  readonly tag: string;
}> = [
  { active: 'Trazabilidad', ghost: 'Manual', tag: 'Línea de clasificación C1' },
  { active: 'Control Directo', ghost: 'Retrasos', tag: 'Seguimiento de bultos en planta' },
  { active: 'Precisión', ghost: 'Errores', tag: 'Verificación óptica activa' },
  { active: 'Seguridad', ghost: 'Riesgos', tag: 'Identidad única certificada' }
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

export const LandingPage: React.FC<LandingPageProps> = ({ warehouseState }) => {
  const { packages, metrics } = warehouseState;
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [replayKey, setReplayKey] = useState<number>(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % MORPHING_WORDS.length);
    }, 3000);
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

      <header className="lt-public-header">
        <div className="lt-public-header-inner">
          <Link to="/" className="lt-public-brand" aria-label="LogiTrack Express Inicio">
            <BrandMark size={30} />
            <span className="lt-public-logo-text">LogiTrack Express</span>
          </Link>

          <nav className="lt-public-top-nav" aria-label="Secciones principales">
            <button
              type="button"
              className="lt-public-nav-anchor"
              onClick={() => scrollToSection('ergonomia')}
            >
              Ergonomía visual
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
        <section id="hero" className="lt-landing-hero" aria-labelledby="landing-hero-heading">
          <div className="lt-geo-field" aria-hidden="true">
            <motion.span
              className="lt-geo-shape lt-geo-square-left"
              animate={{ y: [0, -8, 0], rotate: [14, 19, 14] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-circle-left"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-arc-top"
              animate={{ rotate: [-10, 4, -10] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-arc-left"
              animate={{ rotate: [16, 4, 16] }}
              transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-circle-right"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="lt-geo-shape lt-geo-square-right"
              animate={{ y: [0, 8, 0], rotate: [-12, -18, -12] }}
              transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.svg
              className="lt-geo-triangle-left"
              viewBox="0 0 80 70"
              fill="none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <polygon
                points="40,6 74,64 6,64"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>

          <div className="lt-landing-hero-content">
            <h1 id="landing-hero-heading" className="lt-landing-title">
              Control y clasificación de envíos
            </h1>

            <p className="lt-landing-subtitle">
              Coordina recepción, pesaje e inspección de bultos en cada turno con lectura nítida en modo claro y nocturno.
            </p>

            <div className="lt-landing-hero-ctas">
              <Link to="/terminal" className="lt-btn-primary-solid" data-testid="landing-cta-terminal">
                <span>Acceder al panel operativo</span>
              </Link>
              <Link to="/register" className="lt-btn-secondary-surface">
                <span>Crear cuenta de operario</span>
              </Link>
            </div>
          </div>

          {/* Tarjeta central elevada con barra de progreso viva y vista previa */}
          <motion.div
            className="lt-hero-elevated-sheet"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
          >
            {/* Barra de progreso fina sincronizada con el ciclo de estado */}
            <div className="lt-sheet-cycle-track" aria-hidden="true">
              <motion.div
                key={`cycle-${wordIndex}`}
                className="lt-sheet-cycle-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.95, ease: 'linear' }}
              />
            </div>

            <div className="lt-sheet-top-row">
              <span className="lt-sheet-slash" aria-hidden="true" />
              <span className="lt-sheet-live-pill">
                Línea activa: {metrics.total} envíos en seguimiento
              </span>
            </div>

            <div className="lt-sheet-client-label">
              MAD-Cargo Terminal T4 - {currentMorph.tag}
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
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.24 }}
                  >
                    {currentMorph.active}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            <div className="lt-sheet-skeleton-bars" aria-hidden="true">
              <motion.span
                key={`sk1-${replayKey}`}
                className="lt-skel-bar"
                initial={{ width: '18%' }}
                animate={{ width: '85%' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                key={`sk2-${replayKey}`}
                className="lt-skel-bar lt-skel-accent"
                initial={{ width: '14%' }}
                animate={{ width: '65%' }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                key={`sk3-${replayKey}`}
                className="lt-skel-bar"
                initial={{ width: '20%' }}
                animate={{ width: '78%' }}
                transition={{ duration: 0.78, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="lt-sheet-section-heading">Últimos envíos registrados en línea</div>

            <div className="lt-sheet-live-rows">
              {previewPackages.map((pkg) => (
                <div key={pkg.id} className="lt-sheet-pkg-row">
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
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="ergonomia" className="lt-public-band" aria-labelledby="ergonomia-heading">
          <div className="lt-landing-container">
            <div className="lt-landing-section-head">
              <h2 id="ergonomia-heading" className="lt-public-h2">
                Una gama azul pensada para cuidar tu vista en cada turno
              </h2>
              <p className="lt-public-lead">
                El equilibrio entre tonos azul glaciar, cobalto y zafiro aporta calma cognitiva,
                lectura rápida de etiquetas y adaptación instantánea entre modo diurno y nocturno.
              </p>
            </div>

            <div className="lt-palette-grid">
              <article className="lt-surface-card">
                <div className="lt-swatch-chip lt-swatch-glacier" />
                <h3>Descanso visual diurno</h3>
                <p>Fondos claros equilibrados que reducen reflejos durante jornadas largas en oficina o almacén.</p>
              </article>

              <article className="lt-surface-card">
                <div className="lt-swatch-chip lt-swatch-cobalt" />
                <h3>Cobalto de precisión operativa</h3>
                <p>Destaca acciones principales, botones de clasificación y controles clave con contraste de alta legibilidad.</p>
              </article>

              <article className="lt-surface-card">
                <div className="lt-swatch-chip lt-swatch-cerulean" />
                <h3>Señalización clara de estados</h3>
                <p>Estados diferenciados por color, icono y texto para evitar errores al clasificar envíos urgentes.</p>
              </article>

              <article className="lt-surface-card">
                <div className="lt-swatch-chip lt-swatch-sapphire" />
                <h3>Modo nocturno completo</h3>
                <p>Cambia toda la plataforma a modo oscuro con un clic cuando trabajes en naves con iluminación reducida.</p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="indicadores"
          className="lt-public-band lt-public-band-alt"
          aria-labelledby="indicadores-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-section-head lt-head-split-row">
              <div>
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
                <span>Recargar métricas</span>
              </button>
            </div>

            <GlassyStagger className="lt-bento-overview-grid" replayKey={replayKey}>
              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={speedometerOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">Envíos en planta</span>
                <strong className="lt-bento-big lt-tabular-nums">
                  <AnimatedMetricNumber value={metrics.total} replayKey={replayKey} />
                </strong>
                <p>Control sincronizado con {metrics.totalWeightKg.toFixed(1)} kg acumulados en línea.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">Envíos pendientes</span>
                <strong className="lt-bento-big lt-tabular-nums">
                  <AnimatedMetricNumber value={metrics.inTransit} replayKey={replayKey} />
                </strong>
                <p>Navegación por teclado, lectura asistida y contraste óptimo en modo claro y oscuro.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={layersOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">Clasificación completada</span>
                <strong className="lt-bento-big lt-tabular-nums">
                  <AnimatedMetricNumber value={metrics.inspectionRatePercent} suffix="%" replayKey={replayKey} />
                </strong>
                <p>Flujo ágil por páginas para revisar, aprobar o desviar envíos sin desplazamientos largos.</p>
              </GlassyReveal>

              <GlassyReveal className="lt-surface-card lt-bento-stat-card" hoverLift>
                <div className="lt-bento-icon-pill">
                  <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                </div>
                <span className="lt-bento-label">Identidad única por bulto</span>
                <strong className="lt-bento-big lt-tabular-nums">128 bits</strong>
                <p>Cada envío dispone de una referencia irrepetible que garantiza trazabilidad entre centros.</p>
              </GlassyReveal>
            </GlassyStagger>
          </div>
        </section>

        <section id="operacion" className="lt-public-band" aria-labelledby="operacion-heading">
          <div className="lt-landing-container">
            <div className="lt-landing-two-col">
              <article className="lt-surface-card lt-feature-panel">
                <h2 id="operacion-heading" className="lt-public-h3">
                  <IonIcon icon={cloudDoneOutline} aria-hidden="true" /> Persistencia en la nube y registro histórico
                </h2>
                <p className="lt-public-p">
                  Cada movimiento en la cinta se guarda de forma segura en la base de datos central,
                  generando copias de respaldo automáticas, manifiestos firmados y trazabilidad
                  completa de cada turno.
                </p>
                <Link to="/cloud-infra" className="lt-inline-action-link">
                  <span>Abrir centro de sincronización</span>
                </Link>
              </article>

              <article className="lt-surface-card lt-feature-panel">
                <h2 className="lt-public-h3">
                  <IonIcon icon={syncOutline} aria-hidden="true" /> Control de calidad y continuidad de servicio
                </h2>
                <p className="lt-public-p">
                  La plataforma ejecuta verificaciones automáticas de integridad, pruebas de servicio
                  y publicación continua sin cortes para mantener el centro operativo en cada turno.
                </p>
                <div className="lt-status-chips-row" aria-label="Garantías de servicio">
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Verificación automática</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Respaldo en vivo</span>
                  <span><IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Cierre de turno firmado</span>
                </div>
              </article>
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
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lt-public-footer">
        <div className="lt-landing-container lt-landing-footer-inner">
          <span>
            <strong>LogiTrack Express</strong> - Plataforma de Control y Clasificación Logística
          </span>
          <span>Centros operativos MAD-HUB-01, BCN-ZAL y VLC-Puerto</span>
        </div>
      </footer>
    </div>
  );
};
