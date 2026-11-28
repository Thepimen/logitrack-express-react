import React, { useState } from 'react';
import {
  SafeReactivePackageFilter
} from '../services/rxjs-search-audit.service';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';

export interface WcagAndAiAuditPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

export const WcagAndAiAuditPage: React.FC<WcagAndAiAuditPageProps> = ({ warehouseState }) => {
  const { packages } = warehouseState;
  const [benchmarkReport, setBenchmarkReport] = useState<string>(
    'Diagnóstico preparado: pulsa el botón para ejecutar 50 ciclos de filtrado y comprobar la liberación de memoria del buscador.'
  );

  const runMemorySafetyBenchmark = (): void => {
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
  };

  return (
    <div className="lt-dash-wrapper">
      <header className="lt-subpage-topbar">
        <div>
          <h1 id="audit-page-heading" className="lt-subpage-title">
            Accesibilidad universal y diagnóstico del buscador
          </h1>
          <p className="lt-subpage-desc">
            Medidas activas de legibilidad, teclado y estabilidad en memoria comprobables desde el
            navegador.
          </p>
        </div>
        <div className="lt-subpage-topbar-actions">
          <ThemeToggleButton />
        </div>
      </header>

      <main className="lt-subpage-main" aria-labelledby="audit-page-heading">
        <section className="lt-open-info-band" aria-labelledby="wcag-table-heading">
          <h2 id="wcag-table-heading" className="lt-open-band-title">
            Criterios de legibilidad y manejo asistido aplicados en la plataforma
          </h2>

          <div className="lt-table-responsive">
            <table className="lt-audit-table">
              <thead>
                <tr>
                  <th scope="col">Aspecto evaluado</th>
                  <th scope="col">Norma de referencia</th>
                  <th scope="col">Medida aplicada en las pantallas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Contraste cromático en etiquetas y temas diurno y nocturno</td>
                  <td>
                    <strong>WCAG 1.4.3 y 1.4.6</strong>
                  </td>
                  <td>
                    Paleta azul calibrada con selector global Claro y Oscuro persistente en todas
                    las rutas y lectura nítida de estados.
                  </td>
                </tr>
                <tr>
                  <td>Etiquetado semántico de controles, botones e indicadores</td>
                  <td>
                    <strong>WCAG 4.1.2 y 2.5.3</strong>
                  </td>
                  <td>
                    Descripciones contextuales por código de envío, navegación por roles ARIA y
                    avisos accesibles para lectores de pantalla.
                  </td>
                </tr>
                <tr>
                  <td>Manejo mediante teclado físico, lectores láser y pantalla táctil</td>
                  <td>
                    <strong>WCAG 2.4.7 y 2.5.5</strong>
                  </td>
                  <td>
                    Indicador de foco visible de alto contraste, áreas pulsables amplias y respeto
                    a las preferencias de movimiento reducido del sistema.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="lt-surface-card lt-audit-card" aria-labelledby="stability-heading">
          <div className="lt-audit-header-row">
            <div>
              <h2 id="stability-heading">
                Comprobación de estabilidad y liberación de memoria del buscador
              </h2>
              <p className="lt-muted-desc">
                Ejecuta 50 ciclos consecutivos de montaje, búsqueda por prefijo y cierre sobre los
                envíos actuales.
              </p>
            </div>
            <button
              type="button"
              className="lt-btn-primary-solid lt-btn-sm"
              onClick={runMemorySafetyBenchmark}
              data-testid="btn-run-memory-benchmark"
            >
              Ejecutar diagnóstico de 50 ciclos
            </button>
          </div>

          <div
            className="lt-benchmark-output"
            role="status"
            aria-live="polite"
            data-testid="benchmark-status-output"
          >
            {benchmarkReport}
          </div>

          <div className="lt-editorial-split-2">
            <div className="lt-editorial-split-col">
              <h3>Agrupación de pulsaciones para filtrar sin bloqueos</h3>
              <p className="lt-muted-desc">
                El buscador espera una pausa breve de 180 ms entre teclas para filtrar envíos sin
                interrumpir la escritura rápida ni desperdiciar ciclos de cálculo.
              </p>
            </div>
            <div className="lt-editorial-split-col">
              <h3>Cierre automático de procesos al cambiar de vista</h3>
              <p className="lt-muted-desc">
                Al navegar entre páginas o cerrar el turno, los temporizadores y suscripciones del
                buscador se limpian automáticamente evitando acumulación en memoria.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
