import React, { useState } from 'react';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { WarehousePackage, generateUuidV4 } from '../models/package.model';
import { ThemeToggleButton } from '../context/ThemeContext';
import { Conveyor3DStage } from '../components/Conveyor3DStage';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

export interface Telemetry3DPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

/**
 * Vista de Seguimiento 3D de la Cinta Transportadora y Trazabilidad (`/telemetry`)
 */
export const Telemetry3DPage: React.FC<Telemetry3DPageProps> = ({ warehouseState }) => {
  const { packages, metrics, handleStatusChange } = warehouseState;
  const [selectedPkg, setSelectedPkg] = useState<WarehousePackage | null>(packages[0] ?? null);
  const [sampleRef, setSampleRef] = useState<string>(() => generateUuidV4());

  return (
    <div className="lt-dash-wrapper">
      <header className="lt-subpage-topbar">
        <div>
          <span className="lt-kicker-accent">SEGUIMIENTO ESPACIAL EN PLANTA</span>
          <h1 id="telemetry-page-heading" className="lt-subpage-title">
            Cinta Transportadora 3D y Trazabilidad de Bultos
          </h1>
        </div>
        <div className="lt-subpage-topbar-actions">
          <div className="lt-hero-stats-pill lt-tabular-nums" role="status">
            <span>{metrics.total} envíos</span>
            <span>·</span>
            <span>{metrics.totalWeightKg.toFixed(1)} kg</span>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      <main className="lt-subpage-main" aria-labelledby="telemetry-page-heading">
        <GlassyReveal indexDelay={0.04}>
          <Conveyor3DStage
            packages={packages}
            selectedPackage={selectedPkg}
            onSelectPackage={(pkg) => setSelectedPkg(pkg)}
            onStatusChange={handleStatusChange}
          />
        </GlassyReveal>

        <GlassyStagger
          className="lt-two-col-info"
          ariaLabel="Información operativa de trazabilidad y seguridad de envíos"
        >
          <GlassyReveal className="lt-surface-card lt-info-card" hoverLift>
            <span className="lt-kicker-accent">IDENTIFICACIÓN ÚNICA DE SEGURIDAD</span>
            <h2>Trazabilidad irrepetible para cada bulto en red multi-centro</h2>
            <p className="lt-muted-desc">
              Cada paquete recibe un código único de 128 bits al entrar en el muelle de carga. Esto
              garantiza que nunca existan duplicados aunque varios centros registren mercancía al
              mismo tiempo y evita accesos no autorizados a envíos de terceros.
            </p>
            <div className="lt-uuid-inspector">
              <div>
                <span className="lt-mono-label">EJEMPLO DE REFERENCIA ÚNICA ACTIVA</span>
                <code className="lt-uuid-highlight">{sampleRef}</code>
              </div>
              <button
                type="button"
                className="lt-btn-secondary-surface lt-btn-sm"
                onClick={() => setSampleRef(generateUuidV4())}
              >
                Generar nueva referencia
              </button>
            </div>
          </GlassyReveal>

          <GlassyReveal className="lt-surface-card lt-info-card" hoverLift>
            <span className="lt-kicker-accent">CONTROL EN TIEMPO REAL</span>
            <h2>Inspección directa desde el plano tridimensional</h2>
            <ul className="lt-tech-list">
              <li>
                <strong>Selección instantánea:</strong> Haz clic sobre cualquier caja de la cinta 3D
                para revisar su centro de destino, peso en báscula y observaciones del turno.
              </li>
              <li>
                <strong>Clasificación en un toque:</strong> Aprueba o deriva envíos a cuarentena
                directamente desde el panel lateral sincronizando el cambio en toda la planta.
              </li>
              <li>
                <strong>Control de cámara libre:</strong> Ajusta la inclinación, la rotación o pausa
                la cinta para inspeccionar zonas de alta densidad de carga.
              </li>
            </ul>
          </GlassyReveal>
        </GlassyStagger>
      </main>
    </div>
  );
};
