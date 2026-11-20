import React, { useState } from 'react';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { WarehousePackage, generateUuidV4 } from '../models/package.model';
import { Conveyor3DStage } from '../components/Conveyor3DStage';

export interface Telemetry3DPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

/**
 * Vista de Telemetría 3D, Arquitectura React Hooks y Criptografía UUID v4 (`/telemetry`)
 * Expone en producción el Gemelo Digital 3D a pantalla completa junto con la inspección
 * interactiva de UUID v4 (RFC 9562), Interpolación / Property Binding y Hooks de React 19.
 */
export const Telemetry3DPage: React.FC<Telemetry3DPageProps> = ({ warehouseState }) => {
  const { packages, metrics, handleStatusChange } = warehouseState;
  const [selectedPkg, setSelectedPkg] = useState<WarehousePackage | null>(packages[0] ?? null);
  const [sampleUuid, setSampleUuid] = useState<string>(() => generateUuidV4());

  return (
    <main className="lt-telemetry-main" aria-labelledby="telemetry-page-heading">
      <div className="lt-workspace-container">
        <header className="lt-page-hero-header">
          <div>
            <span className="lt-kicker-amber">
              ARQUITECTURA AVANZADA · GEMELO DIGITAL 3D &amp; CRIPTOGRAFÍA UUID v4
            </span>
            <h1 id="telemetry-page-heading" className="lt-page-title">
              Telemetría Volumétrica 3D, React 19 Hooks e Identidad Distribuida
            </h1>
          </div>
          <div className="lt-hero-stats lt-tabular-nums" role="status">
            <span>PAQUETES EN ESCÁNER: {metrics.total}</span>
            <span>MASA TOTAL: {metrics.totalWeightKg.toFixed(2)} KG</span>
          </div>
        </header>

        {/* Escenario Isométrico 3D Completo */}
        <Conveyor3DStage
          packages={packages}
          selectedPackage={selectedPkg}
          onSelectPackage={(pkg) => setSelectedPkg(pkg)}
          onStatusChange={handleStatusChange}
        />

        {/* Panel de Ingeniería: Por qué UUID v4 frente a ID Secuencial + Hooks de React 19 */}
        <section
          className="lt-arch-grid"
          aria-label="Justificación arquitectónica de UUID v4, React Hooks y Data Binding"
        >
          <article className="lt-arch-card">
            <span className="lt-section-kicker">INGENIERÍA DE DATOS &amp; SEGURIDAD (TAREA 1)</span>
            <h2>¿Por qué UUID v4 (128 bits) en lugar de un ID Autoincremental (1, 2, 3...)?</h2>
            <p>
              En una planta logística industrial como <strong>LogiTrack Express</strong>, múltiples
              pistolas láser y tablets operan simultáneamente sobre distintas cintas transportadoras
              (con micro-cortes de red Wi-Fi industrial):
            </p>
            <ul className="lt-tech-list">
              <li>
                <strong>Generación Descentralizada sin Colisiones:</strong> Con un entero secuencial
                (<code>SERIAL / IDENTITY</code>), dos terminales offline que creen un paquete al
                mismo tiempo generarían el mismo <code>id = 9</code> provocando colisión de clave
                primaria. Con <strong>UUID v4 (RFC 9562)</strong> generado vía{' '}
                <code>crypto.randomUUID()</code> (122 bits de entropía CSPRNG,{' '}
                <code>5.3 × 10³⁶</code> combinaciones), cada terminal asigna la PK antes incluso de
                impactar en Supabase PostgreSQL.
              </li>
              <li>
                <strong>Mitigación de Vulnerabilidades IDOR (OWASP API1:2023):</strong> Los IDs
                secuenciales permiten enumerar paquetes ajenos incrementando{' '}
                <code>/packages/101</code>, <code>/packages/102</code>. Un UUID v4 es
                criptográficamente impredecible.
              </li>
            </ul>

            <div className="lt-uuid-inspector">
              <div>
                <span className="lt-mono-label">DISECCIÓN DE BITS UUID v4 ACTIVO:</span>
                <code className="lt-uuid-highlight">{sampleUuid}</code>
              </div>
              <button
                type="button"
                className="lt-secondary-btn"
                onClick={() => setSampleUuid(generateUuidV4())}
              >
                GENERAR NUEVO UUID v4
              </button>
            </div>
          </article>

          <article className="lt-arch-card">
            <span className="lt-section-kicker">ARQUITECTURA REACT 19 + IONIC v8 vs ANGULAR</span>
            <h2>Ciclo de Vida de React Hooks e Interpolación / Property Binding</h2>
            <p>
              La arquitectura desacoplada se articula mediante <strong>Custom Hooks</strong> que
              sustituyen la complejidad ceremonial de módulos por funciones puras composables:
            </p>
            <ul className="lt-tech-list">
              <li>
                <strong><code>useState</code> + Inmutabilidad:</strong> Mantiene el snapshot local
                de <code>ReadonlyArray&lt;WarehousePackage&gt;</code> y dispara el reconciliador
                Fiber solo cuando cambia la referencia del array tras un CRUD en Supabase.
              </li>
              <li>
                <strong><code>useEffect</code> con Cleanup Determinista:</strong> Gestiona la
                suscripción al servicio y el temporizador de <em>debounce</em> (180 ms), devolviendo
                siempre una función de limpieza para garantizar <strong>0 fugas de memoria</strong>.
              </li>
              <li>
                <strong><code>useMemo</code> &amp; <code>useDeferredValue</code>:</strong> Homólogo
                directo de <code>computed()</code> en Angular Signals; recalcula la lista filtrada y
                los KPIs de peso únicamente cuando mutan las dependencias.
              </li>
              <li>
                <strong>Interpolación vs Property Binding en JSX:</strong> La interpolación inyecta
                expresiones evaluadas como nodos de texto (<code>{'{pkg.trackingCode}'}</code>),
                mientras que el <em>Property Binding</em> enlaza referencias tipadas y callbacks a
                propiedades del DOM/Web Component (<code>{'pkg={pkg}'}</code>,{' '}
                <code>{'disabled={isMutating}'}</code>, <code>{'onStatusChange={handleStatusChange}'}</code>).
              </li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
};
