import React, { useState } from 'react';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { WarehousePackage, generateUuidV4 } from '../models/package.model';
import { ThemeToggleButton } from '../context/ThemeContext';
import { Conveyor3DStage } from '../components/Conveyor3DStage';

export interface Telemetry3DPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
}

export const Telemetry3DPage: React.FC<Telemetry3DPageProps> = ({ warehouseState }) => {
  const { packages, metrics, handleStatusChange } = warehouseState;
  const [selectedPkg, setSelectedPkg] = useState<WarehousePackage | null>(packages[0] ?? null);
  const [sampleRef, setSampleRef] = useState<string>(() => generateUuidV4());

  return (
    <div className="lt-dash-wrapper">
      <header className="lt-subpage-topbar">
        <div>
          <h1 id="telemetry-page-heading" className="lt-subpage-title">
            Cinta transportadora en 3D y trazabilidad de bultos
          </h1>
          <p className="lt-subpage-desc">
            Inspección espacial de la línea activa con selección directa de cada envío y control de
            cámara.
          </p>
        </div>
        <div className="lt-subpage-topbar-actions">
          <div className="lt-hero-stats-pill lt-tabular-nums" role="status">
            <span>{metrics.total} envíos</span>
            <span>({metrics.totalWeightKg.toFixed(1)} kg)</span>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      <main className="lt-subpage-main" aria-labelledby="telemetry-page-heading">
        <Conveyor3DStage
          packages={packages}
          selectedPackage={selectedPkg}
          onSelectPackage={(pkg) => setSelectedPkg(pkg)}
          onStatusChange={handleStatusChange}
        />

        {/* Sección informativa abierta con divisor fino en lugar de tarjetas repetidas */}
        <section
          className="lt-open-info-band"
          aria-label="Información operativa de trazabilidad y manejo de la vista tridimensional"
        >
          <div className="lt-editorial-split-2">
            <div className="lt-editorial-split-col">
              <h2>Identificación irrepetible para cada bulto entre centros</h2>
              <p className="lt-muted-desc">
                Cada paquete recibe un código único de 128 bits al entrar en el muelle de carga.
                Esto evita duplicados aunque varios centros registren mercancía simultáneamente e
                impide deducir códigos de envíos ajenos.
              </p>
              <div className="lt-uuid-inspector">
                <div>
                  <span className="lt-mono-label">Ejemplo de referencia generada</span>
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
            </div>

            <div className="lt-editorial-split-col">
              <h2>Cómo operar la inspección desde el plano tridimensional</h2>
              <ul className="lt-tech-list">
                <li>
                  <strong>Selección directa en cinta:</strong> Pulsa sobre cualquier caja de la
                  cinta 3D para consultar su centro de destino, peso verificado y notas del turno.
                </li>
                <li>
                  <strong>Clasificación inmediata desde el visor:</strong> Aprueba o deriva envíos a
                  cuarentena desde el panel lateral sincronizando el cambio en todo el centro.
                </li>
                <li>
                  <strong>Ajuste manual del ángulo de cámara:</strong> Modifica inclinación,
                  rotación o pausa el desplazamiento para revisar zonas con alta densidad de carga.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
