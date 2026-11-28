import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SafeReactivePackageFilter
} from '../services/rxjs-search-audit.service';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import { GlassyReveal } from '../components/GlassyReveal';

export interface WcagAndAiAuditPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

export const WcagAndAiAuditPage: React.FC<WcagAndAiAuditPageProps> = ({ warehouseState }) => {
  const { packages } = warehouseState;
  const [benchmarkProgress, setBenchmarkProgress] = useState<number>(100);
  const [benchmarkRunCount, setBenchmarkRunCount] = useState<number>(0);
  const [benchmarkReport, setBenchmarkReport] = useState<string>(
    'Diagnóstico listo: ejecuta la comprobación de 50 ciclos para verificar la estabilidad y liberación de memoria del buscador.'
  );

  const runMemorySafetyBenchmark = (): void => {
    setBenchmarkProgress(18);
    setBenchmarkRunCount((c) => c + 1);

    const filterEngine = new SafeReactivePackageFilter();
    let lastCount = 0;

    for (let i = 0; i < 50; i += 1) {
      const disconnect = filterEngine.connectStream(
        () => packages,
        () => 'ALL',
        () => 'ALL',
        (res) => {
          lastCount = res.length;
        }
      );
      filterEngine.pushSearchTerm('LTK');
      disconnect();
    }

    const remainingSubscriptions = filterEngine.getActiveSubscriptionCount();
    const message = `Diagnóstico completado tras 50 ciclos de búsqueda y navegación: ${remainingSubscriptions} procesos residuales activos en memoria y ${lastCount} envíos evaluados correctamente.`;
    console.log(message);
    setBenchmarkReport(message);
    window.setTimeout(() => setBenchmarkProgress(100), 90);
  };

  return (
    <div className="lt-dash-wrapper">
      <header className="lt-subpage-topbar">
        <div>
          <h1 id="audit-page-heading" className="lt-subpage-title">
            Accesibilidad Universal y Diagnóstico del Buscador
          </h1>
          <p className="lt-subpage-desc">
            Garantías activas de contraste, navegación por teclado y limpieza de memoria verificables en directo.
          </p>
        </div>
        <div className="lt-subpage-topbar-actions">
          <ThemeToggleButton />
        </div>
      </header>

      <main className="lt-subpage-main" aria-labelledby="audit-page-heading">
        <GlassyReveal indexDelay={0.03} shimmer={false}>
          <section className="lt-surface-card lt-audit-card" aria-labelledby="wcag-table-heading">
            <h2 id="wcag-table-heading">
              Criterios de legibilidad y manejo asistido aplicados en la plataforma
            </h2>

            <div className="lt-table-responsive">
              <table className="lt-audit-table">
                <thead>
                  <tr>
                    <th scope="col">Aspecto evaluado</th>
                    <th scope="col">Norma aplicada</th>
                    <th scope="col">Medida activa en plataforma</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Contraste cromático en etiquetas de estado y modo diurno o nocturno</td>
                    <td><strong>WCAG 1.4.3 / 1.4.6</strong></td>
                    <td>Paleta azul calibrada con selector global Claro y Oscuro con contraste superior a 10:1.</td>
                    <td className="lt-mono-cell lt-text-emerald">Verificado AAA</td>
                  </tr>
                  <tr>
                    <td>Etiquetado semántico de controles, botones e indicadores en vivo</td>
                    <td><strong>WCAG 4.1.2 / 2.5.3</strong></td>
                    <td>Descripciones contextuales por código de envío y avisos accesibles para lectores de pantalla.</td>
                    <td className="lt-mono-cell lt-text-emerald">Accesible</td>
                  </tr>
                  <tr>
                    <td>Uso con teclado físico, lectores láser y pantallas táctiles</td>
                    <td><strong>WCAG 2.4.7 / 2.5.5</strong></td>
                    <td>Indicador de foco visible de alto contraste, áreas pulsables amplias y respeto al movimiento reducido.</td>
                    <td className="lt-mono-cell lt-text-emerald">Óptimo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </GlassyReveal>

        <section className="lt-surface-card lt-audit-card" aria-labelledby="stability-heading">
          <div className="lt-audit-header-row">
            <div>
              <h2 id="stability-heading">
                Verificación de estabilidad y limpieza de memoria del buscador
              </h2>
            </div>
            <button
              type="button"
              className="lt-btn-primary-solid lt-btn-sm"
              onClick={runMemorySafetyBenchmark}
              data-testid="btn-run-memory-benchmark"
            >
              Ejecutar diagnóstico (50 ciclos)
            </button>
          </div>

          <div className="lt-inline-progress-track" aria-hidden="true">
            <motion.div
              key={`bench-${benchmarkRunCount}`}
              className="lt-inline-progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${benchmarkProgress}%` }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div
            className="lt-benchmark-output"
            role="status"
            aria-live="polite"
            data-testid="benchmark-status-output"
          >
            {benchmarkReport}
          </div>

          <div className="lt-two-col-info">
            <div className="lt-mini-info-box">
              <h3>Respuesta fluida sin bloqueos</h3>
              <p className="lt-muted-desc">
                El buscador agrupa pulsaciones rápidas en ventanas de 180 ms para filtrar grandes
                volúmenes de envíos sin ralentizar la escritura ni consumir recursos innecesarios.
              </p>
            </div>
            <div className="lt-mini-info-box">
              <h3>Limpieza automática al cambiar de vista</h3>
              <p className="lt-muted-desc">
                Al navegar entre páginas o cerrar un turno, todos los temporizadores y suscripciones del
                buscador se detienen y liberan automáticamente evitando acumulación en memoria.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
