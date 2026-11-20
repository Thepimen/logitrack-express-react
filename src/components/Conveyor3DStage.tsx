import React, { useState } from 'react';
import { PackageStatus, PackageStatusChangeEvent, WarehousePackage } from '../models/package.model';

export interface Conveyor3DStageProps {
  readonly packages: ReadonlyArray<WarehousePackage>;
  readonly selectedPackage: WarehousePackage | null;
  readonly onSelectPackage: (pkg: WarehousePackage) => void;
  readonly onStatusChange?: (event: PackageStatusChangeEvent) => void | Promise<void>;
  readonly compact?: boolean;
}

/**
 * Gemelo Digital Isométrico 3D de Cinta Transportadora (Skills: emilkowalski/skills & Leonxlnx/taste-skill)
 * Renderiza en hardware (CSS 3D Matrix Transforms con `transform-style: preserve-3d`) la línea
 * logística C1 de LogiTrack Express, mostrando cada paquete real de Supabase en perspectiva
 * volumétrica de 6 caras con pórtico de escaneo láser y telemetría interactiva.
 */
export const Conveyor3DStage: React.FC<Conveyor3DStageProps> = ({
  packages,
  selectedPackage,
  onSelectPackage,
  onStatusChange,
  compact = false
}) => {
  const [pitchDeg, setPitchDeg] = useState<number>(56);
  const [yawDeg, setYawDeg] = useState<number>(-32);
  const [isBeltPaused, setIsBeltPaused] = useState<boolean>(false);

  const activePkg = selectedPackage ?? packages[0] ?? null;

  const getParcelHeightPx = (weightKg: number): number => {
    return Math.min(66, Math.max(28, Math.round(24 + weightKg * 0.95)));
  };

  const getStatusColorHex = (status: PackageStatus): string => {
    if (status === 'INSPECTED') return '#10B981';
    if (status === 'REJECTED') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <section
      className={`lt-conveyor-3d-shell ${compact ? 'lt-conveyor-compact' : ''}`}
      aria-label="Gemelo digital isométrico 3D de cinta transportadora LogiTrack Express"
    >
      <div className="lt-conveyor-3d-topbar">
        <div className="lt-conveyor-title-group">
          <span className="lt-live-dot" aria-hidden="true" />
          <div>
            <h2 className="lt-conveyor-heading">
              GEMELO DIGITAL 3D · LÍNEA DE CLASIFICACIÓN C1 (MAD-HUB-01)
            </h2>
            <p className="lt-conveyor-sub">
              Proyección volumétrica CSS 3D a 60fps sincronizada con PostgreSQL ({packages.length}{' '}
              unidades activas)
            </p>
          </div>
        </div>

        <div className="lt-conveyor-controls" role="group" aria-label="Controles de cámara 3D">
          <label className="lt-3d-slider-label">
            <span>INCLINACIÓN X ({pitchDeg}°)</span>
            <input
              type="range"
              min={35}
              max={72}
              value={pitchDeg}
              onChange={(e) => setPitchDeg(Number(e.target.value))}
              aria-label="Ángulo de inclinación vertical X de la cámara 3D"
            />
          </label>
          <label className="lt-3d-slider-label">
            <span>ROTACIÓN Z ({yawDeg}°)</span>
            <input
              type="range"
              min={-65}
              max={15}
              value={yawDeg}
              onChange={(e) => setYawDeg(Number(e.target.value))}
              aria-label="Ángulo de rotación horizontal Z de la cámara 3D"
            />
          </label>
          <button
            type="button"
            className="lt-3d-toggle-btn"
            onClick={() => setIsBeltPaused((prev) => !prev)}
            aria-pressed={isBeltPaused}
          >
            {isBeltPaused ? 'REANUDAR CINTA 3D' : 'PAUSAR CINTA 3D'}
          </button>
          <button
            type="button"
            className="lt-3d-toggle-btn"
            onClick={() => {
              setPitchDeg(56);
              setYawDeg(-32);
            }}
          >
            VISTA ISOMÉTRICA
          </button>
        </div>
      </div>

      <div className="lt-conveyor-3d-Grid">
        {/* Escenario 3D con perspective: 1200px */}
        <div className="lt-scene-viewport">
          <div
            className={`lt-scene-plane ${isBeltPaused ? 'lt-belt-paused' : ''}`}
            style={{
              transform: `rotateX(${pitchDeg}deg) rotateZ(${yawDeg}deg)`
            }}
          >
            {/* Superficie de rodillos de la cinta transportadora */}
            <div className="lt-belt-surface">
              <div className="lt-belt-rollers" />
              <div className="lt-belt-guide-rail lt-rail-north" />
              <div className="lt-belt-guide-rail lt-rail-south" />

              {/* Pórtico central de escaneo óptico láser 3D */}
              <div className="lt-laser-gantry" aria-hidden="true">
                <div className="lt-gantry-pillar lt-pillar-left" />
                <div className="lt-gantry-pillar lt-pillar-right" />
                <div className="lt-gantry-bridge">
                  <span className="lt-gantry-label">OPTICAL RFID GATE · S04</span>
                </div>
                <div className="lt-laser-sheet" />
              </div>

              {/* Renderizado 3D volumétrico de cada paquete de Supabase */}
              {packages.slice(0, 8).map((pkg, idx) => {
                const heightPx = getParcelHeightPx(pkg.weightKg);
                const isSelected = activePkg?.id === pkg.id;
                const xOffsetPercent = 8 + idx * 11.5;
                const yOffsetPx = idx % 2 === 0 ? -18 : 20;
                const accentColor = getStatusColorHex(pkg.status);

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => onSelectPackage(pkg)}
                    className={`lt-parcel-3d lt-parcel-status-${pkg.status.toLowerCase()} ${
                      isSelected ? 'lt-parcel-selected' : ''
                    }`}
                    style={
                      {
                        left: `${xOffsetPercent}%`,
                        marginTop: `${yOffsetPx}px`,
                        '--parcel-h': `${heightPx}px`,
                        '--parcel-accent': accentColor
                      } as React.CSSProperties
                    }
                    aria-label={`Paquete 3D ${pkg.trackingCode}, peso ${pkg.weightKg} kg, estado ${pkg.status}`}
                  >
                    <span className="lt-cube-face lt-cube-top">
                      <span className="lt-cube-code">{pkg.trackingCode}</span>
                      <span className="lt-cube-weight lt-tabular-nums">{pkg.weightKg}kg</span>
                    </span>
                    <span className="lt-cube-face lt-cube-front" />
                    <span className="lt-cube-face lt-cube-right" />
                    <span className="lt-cube-face lt-cube-left" />
                    <span className="lt-cube-face lt-cube-back" />
                    <span className="lt-cube-shadow" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral de telemetría del paquete seleccionado en el escáner 3D */}
        {activePkg && (
          <aside
            className="lt-3d-inspector-panel"
            aria-label={`Telemetría de unidad seleccionada ${activePkg.trackingCode}`}
          >
            <div className="lt-3d-panel-header">
              <span className="lt-3d-tag">UNIDAD EN FOCO LÁSER</span>
              <strong className="lt-3d-code">{activePkg.trackingCode}</strong>
            </div>

            <dl className="lt-3d-specs">
              <div>
                <dt>UUID v4 (RFC 9562)</dt>
                <dd className="lt-mono-small">{activePkg.id}</dd>
              </div>
              <div>
                <dt>HUB DESTINO</dt>
                <dd>{activePkg.destinationHub}</dd>
              </div>
              <div>
                <dt>MASA / PRIORIDAD</dt>
                <dd className="lt-tabular-nums">
                  {activePkg.weightKg.toFixed(2)} kg · {activePkg.priority}
                </dd>
              </div>
              <div>
                <dt>SECTOR CINTA</dt>
                <dd>{activePkg.aisleBay}</dd>
              </div>
              <div>
                <dt>DIAGNÓSTICO</dt>
                <dd>{activePkg.inspectorNotes || 'Sin incidencias registradas'}</dd>
              </div>
            </dl>

            {onStatusChange && (
              <div className="lt-3d-quick-actions">
                <button
                  type="button"
                  className="lt-3d-action-approve"
                  disabled={activePkg.status === 'INSPECTED'}
                  onClick={() =>
                    void onStatusChange({ id: activePkg.id, newStatus: 'INSPECTED' })
                  }
                >
                  APROBAR (INSPECTED)
                </button>
                <button
                  type="button"
                  className="lt-3d-action-reject"
                  disabled={activePkg.status === 'REJECTED'}
                  onClick={() =>
                    void onStatusChange({ id: activePkg.id, newStatus: 'REJECTED' })
                  }
                >
                  CUARENTENA (REJECTED)
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
};
