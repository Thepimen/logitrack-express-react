import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  cloudDoneOutline,
  refreshOutline,
  syncOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';

export interface LandingPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

const FOCUS_SCENES: ReadonlyArray<{
  readonly headline: string;
  readonly detail: string;
}> = [
  {
    headline: 'Recepción y pesaje en muelle principal',
    detail: 'Línea de clasificación C1 en MAD-Cargo Terminal T4'
  },
  {
    headline: 'Verificación de precintos y prioridades',
    detail: 'Control de bultos urgentes antes del embarque'
  },
  {
    headline: 'Clasificación por páginas sin desplazamientos largos',
    detail: 'Consulta ágil por código de seguimiento o destino'
  },
  {
    headline: 'Registro cronológico de copias y cierre de turno',
    detail: 'Manifiestos descargables y seguimiento por identificador único'
  }
];

const LANDING_SECTIONS: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: 'hero', label: 'Inicio' },
  { id: 'ergonomia', label: 'Ergonomía visual' },
  { id: 'indicadores', label: 'Estado de planta' },
  { id: 'operacion', label: 'Continuidad operativa' }
];

const STATUS_READABLE: Record<string, string> = {
  IN_TRANSIT: 'En cinta',
  INSPECTED: 'Aprobado',
  REJECTED: 'Cuarentena'
};

export const LandingPage: React.FC<LandingPageProps> = ({ warehouseState }) => {
  const { packages, metrics, reloadPackages } = warehouseState;
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % FOCUS_SCENES.length);
    }, 3400);
    return () => window.clearInterval(interval);
  }, []);

  const currentScene = FOCUS_SCENES[sceneIndex];
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
            <BrandMark size={34} />
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
              Estado de planta
            </button>
            <button
              type="button"
              className="lt-public-nav-anchor"
              onClick={() => scrollToSection('operacion')}
            >
              Sincronización y copias
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
            <span className="lt-geo-shape lt-geo-square-left" />
            <span className="lt-geo-shape lt-geo-circle-left" />
            <span className="lt-geo-shape lt-geo-arc-top" />
            <span className="lt-geo-shape lt-geo-arc-left" />
            <span className="lt-geo-shape lt-geo-circle-right" />
            <span className="lt-geo-shape lt-geo-square-right" />
            <svg className="lt-geo-triangle-left" viewBox="0 0 80 70" fill="none">
              <polygon
                points="40,6 74,64 6,64"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="lt-landing-hero-content">
            <h1 id="landing-hero-heading" className="lt-landing-title">
              Recepción, inspección y clasificación de envíos
            </h1>

            <p className="lt-landing-subtitle">
              Coordina los bultos de cada turno desde la entrada en muelle hasta su aprobación o
              cuarentena con lectura clara en modo diurno y nocturno.
            </p>

            <div className="lt-landing-hero-ctas">
              <Link to="/terminal" className="lt-btn-primary-solid" data-testid="landing-cta-terminal">
                Acceder al panel operativo
              </Link>
              <Link to="/register" className="lt-btn-secondary-surface">
                Crear cuenta de operario
              </Link>
            </div>
          </div>

          <div className="lt-hero-elevated-sheet">
            <div className="lt-sheet-top-row">
              <span className="lt-sheet-slash" aria-hidden="true" />
              <span className="lt-sheet-live-pill lt-tabular-nums">
                {metrics.total} envíos activos en seguimiento
              </span>
            </div>

            <div className="lt-sheet-client-label">{currentScene.detail}</div>

            <div className="lt-sheet-morph-line" aria-live="polite">
              <span className="lt-sheet-active-highlight">{currentScene.headline}</span>
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
          </div>
        </section>

        {/* Sección abierta sin tarjetas anidadas: retícula editorial con separadores finos */}
        <section id="ergonomia" className="lt-public-band" aria-labelledby="ergonomia-heading">
          <div className="lt-landing-container">
            <div className="lt-landing-section-head">
              <h2 id="ergonomia-heading" className="lt-public-h2">
                Una gama azul pensada para cuidar la vista durante todo el turno
              </h2>
              <p className="lt-public-lead">
                La combinación de azul hielo, cobalto y azul noche reduce reflejos, agiliza la
                lectura de etiquetas y mantiene coherencia completa al alternar entre modo claro y
                modo oscuro.
              </p>
            </div>

            <div className="lt-editorial-columns-4">
              <article className="lt-editorial-col-item">
                <div className="lt-swatch-chip lt-swatch-glacier" />
                <h3>Fondo claro atenuado para oficinas y muelles</h3>
                <p>
                  Superficies limpias en tono azul hielo que evitan el deslumbramiento en pantallas
                  de escritorio y tabletas industriales.
                </p>
              </article>

              <article className="lt-editorial-col-item">
                <div className="lt-swatch-chip lt-swatch-cobalt" />
                <h3>Azul cobalto para controles y acciones principales</h3>
                <p>
                  Identifica de forma inmediata los botones de registro, paginación y validación sin
                  recargar la pantalla con avisos innecesarios.
                </p>
              </article>

              <article className="lt-editorial-col-item">
                <div className="lt-swatch-chip lt-swatch-cerulean" />
                <h3>Etiquetas diferenciadas por color, icono y texto</h3>
                <p>
                  Cada estado del envío se distingue visualmente y mediante texto descriptivo para
                  evitar confusiones al clasificar bultos urgentes.
                </p>
              </article>

              <article className="lt-editorial-col-item">
                <div className="lt-swatch-chip lt-swatch-sapphire" />
                <h3>Modo oscuro uniforme para naves con poca luz</h3>
                <p>
                  Al elegir el modo oscuro, todas las vistas de la aplicación cambian de forma
                  coordinada y recuerdan tu preferencia en cada visita.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Tira abierta de indicadores calculados directamente desde los envíos activos */}
        <section
          id="indicadores"
          className="lt-public-band lt-public-band-alt"
          aria-labelledby="indicadores-heading"
        >
          <div className="lt-landing-container">
            <div className="lt-landing-section-head lt-head-split-row">
              <div>
                <h2 id="indicadores-heading" className="lt-public-h2">
                  Resumen actual del centro de clasificación
                </h2>
                <p className="lt-public-lead">
                  Cifras obtenidas directamente de los bultos registrados en la línea activa.
                </p>
              </div>
              <button
                type="button"
                className="lt-btn-secondary-surface lt-btn-sm"
                onClick={() => void reloadPackages()}
              >
                <IonIcon icon={refreshOutline} aria-hidden="true" />
                <span>Actualizar datos</span>
              </button>
            </div>

            <div className="lt-open-metrics-strip">
              <div className="lt-open-metric-cell">
                <span className="lt-bento-label">Envíos registrados en línea</span>
                <strong className="lt-bento-big lt-tabular-nums">{metrics.total}</strong>
                <p>Total de bultos cargados actualmente en la cinta de clasificación.</p>
              </div>

              <div className="lt-open-metric-cell">
                <span className="lt-bento-label">Envíos pendientes en cinta</span>
                <strong className="lt-bento-big lt-tabular-nums">{metrics.inTransit}</strong>
                <p>Bultos a la espera de verificación física y asignación de salida.</p>
              </div>

              <div className="lt-open-metric-cell">
                <span className="lt-bento-label">Progreso de clasificación del turno</span>
                <strong className="lt-bento-big lt-tabular-nums">
                  {metrics.inspectionRatePercent}%
                </strong>
                <p>
                  {metrics.inspected} envíos aprobados y {metrics.rejected} derivados a cuarentena.
                </p>
              </div>

              <div className="lt-open-metric-cell">
                <span className="lt-bento-label">Peso acumulado en báscula</span>
                <strong className="lt-bento-big lt-tabular-nums">
                  {metrics.totalWeightKg.toFixed(1)} kg
                </strong>
                <p>Suma de los pesos verificados de la mercancía actualmente activa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloque editorial abierto de dos columnas + cierre limpio */}
        <section id="operacion" className="lt-public-band" aria-labelledby="operacion-heading">
          <div className="lt-landing-container">
            <div className="lt-editorial-split-2">
              <div className="lt-editorial-split-col">
                <h2 id="operacion-heading" className="lt-public-h3">
                  <IonIcon icon={cloudDoneOutline} aria-hidden="true" /> Almacenamiento centralizado
                  y copias de cierre de turno
                </h2>
                <p className="lt-public-p">
                  Cada movimiento de recepción, aprobación o cuarentena se registra en la base de
                  datos central y mantiene copias de consulta rápida junto con manifiestos firmados
                  para auditorías de transporte.
                </p>
                <Link to="/cloud-infra" className="lt-inline-action-link">
                  Abrir centro de sincronización y respaldo
                </Link>
              </div>

              <div className="lt-editorial-split-col">
                <h2 className="lt-public-h3">
                  <IonIcon icon={syncOutline} aria-hidden="true" /> Revisión automática y
                  disponibilidad del servicio
                </h2>
                <p className="lt-public-p">
                  El sistema incorpora controles automáticos sobre formularios, accesibilidad y
                  limpieza de memoria del buscador para mantener una respuesta constante durante
                  toda la jornada laboral.
                </p>
                <div className="lt-status-chips-row" aria-label="Garantías operativas">
                  <span>
                    <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Validación de
                    formularios
                  </span>
                  <span>
                    <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Copias de
                    seguridad en línea
                  </span>
                  <span>
                    <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Navegación por
                    teclado y móvil
                  </span>
                </div>
              </div>
            </div>

            <div className="lt-public-final-cta">
              <div>
                <h3>Empieza a gestionar los envíos de tu turno</h3>
                <p>
                  Inicia sesión con tu placa de operario o registra una cuenta nueva para acceder al
                  panel principal.
                </p>
              </div>
              <div className="lt-landing-final-buttons">
                <Link to="/login" className="lt-btn-secondary-surface">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="lt-btn-primary-solid">
                  Crear cuenta de operario
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lt-public-footer">
        <div className="lt-landing-container lt-landing-footer-inner">
          <span>
            <strong>LogiTrack Express</strong> — Plataforma de gestión y clasificación logística
          </span>
          <span>Centros operativos MAD-HUB-01, BCN-ZAL y VLC-Puerto</span>
        </div>
      </footer>
    </div>
  );
};
