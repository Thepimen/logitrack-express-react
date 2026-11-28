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
 * Visor 3D Interactivo de la Cinta Transportadora de Clasificación
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
    return '#2563EB';
  };

  return (
    <section
      className={`lt-surface-card lt-conveyor-3d-shell ${compact ? 'lt-conveyor-compact' : ''}`}
      aria-label="Vista tridimensional interactiva de la cinta transportadora"
    >
      <div className="lt-conveyor-3d-topbar">
        <div className="lt-conveyor-title-group">
          <div>
            <h2 className="lt-conveyor-heading">
              Cinta transportadora activa en línea C1 (MAD-HUB-01)
            </h2>
            <p className="lt-conveyor-sub">
              Seguimiento espacial en directo ({packages.length} envíos en movimiento)
            </p>
          </div>
        </div>

        <div className="lt-conveyor-controls" role="group" aria-label="Controles de cámara">
          <label className="lt-3d-slider-label">
            <span>Inclinación ({pitchDeg}°)</span>
            <input
              type="range"
              min={35}
              max={72}
              value={pitchDeg}
              onChange={(e) => setPitchDeg(Number(e.target.value))}
              aria-label="Ángulo de inclinación vertical de la vista 3D"
            />
          </label>
          <label className="lt-3d-slider-label">
            <span>Rotación ({yawDeg}°)</span>
            <input
              type="range"
              min={-65}
              max={15}
              value={yawDeg}
              onChange={(e) => setYawDeg(Number(e.target.value))}
              aria-label="Ángulo de rotación horizontal de la vista 3D"
            />
          </label>
          <button
            type="button"
            className="lt-btn-secondary-surface lt-btn-xs"
            onClick={() => setIsBeltPaused((prev) => !prev)}
            aria-pressed={isBeltPaused}
          >
            {isBeltPaused ? 'Reanudar cinta' : 'Pausar cinta'}
          </button>
          <button
            type="button"
            className="lt-btn-secondary-surface lt-btn-xs"
            onClick={() => {
              setPitchDeg(56);
              setYawDeg(-32);
            }}
          >
            Restablecer vista
          </button>
        </div>
      </div>

      <div className="lt-conveyor-3d-Grid">
        <div className="lt-scene-viewport">
          <div
            className={`lt-scene-plane ${isBeltPaused ? 'lt-belt-paused' : ''}`}
            style={{
              transform: `rotateX(${pitchDeg}deg) rotateZ(${yawDeg}deg)`
            }}
          >
            <div className="lt-belt-surface">
              <div className="lt-belt-rollers" />
              <div className="lt-belt-guide-rail lt-rail-north" />
              <div className="lt-belt-guide-rail lt-rail-south" />

              <div className="lt-laser-gantry" aria-hidden="true">
                <div className="lt-gantry-bridge">
                  <span className="lt-gantry-label">ESCÁNER ÓPTICO · S04</span>
                </div>
                <div className="lt-laser-sheet" />
              </div>

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
                    aria-label={`${pkg.trackingCode} ${pkg.weightKg}kg`}
                  >
                    <span className="lt-cube-face lt-cube-top">
                      <span className="lt-cube-code">{pkg.trackingCode}</span>
                      <span className="lt-cube-weight lt-tabular-nums">{pkg.weightKg}kg</span>
                    </span>
                    <span className="lt-cube-face lt-cube-front" />
                    <span className="lt-cube-face lt-cube-right" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activePkg && (
          <aside
            className="lt-3d-inspector-panel"
            aria-label={`Detalle del envío seleccionado ${activePkg.trackingCode}`}
          >
            <div className="lt-3d-panel-header">
              <span className="lt-3d-tag">ENVÍO SELECCIONADO</span>
              <strong className="lt-3d-code">{activePkg.trackingCode}</strong>
            </div>

            <dl className="lt-3d-specs">
              <div>
                <dt>Referencia única</dt>
                <dd className="lt-mono-small">{activePkg.id}</dd>
              </div>
              <div>
                <dt>Centro de destino</dt>
                <dd>{activePkg.destinationHub}</dd>
              </div>
              <div>
                <dt>Peso y prioridad</dt>
                <dd className="lt-tabular-nums">
                  {activePkg.weightKg.toFixed(2)} kg · {activePkg.priority}
                </dd>
              </div>
              <div>
                <dt>Sector de cinta</dt>
                <dd>{activePkg.aisleBay.replace(/\s*[·•]\s*/g, ' / ')}</dd>
              </div>
              <div>
                <dt>Notas de inspección</dt>
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
                  Aprobar envío
                </button>
                <button
                  type="button"
                  className="lt-3d-action-reject"
                  disabled={activePkg.status === 'REJECTED'}
                  onClick={() =>
                    void onStatusChange({ id: activePkg.id, newStatus: 'REJECTED' })
                  }
                >
                  A cuarentena
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
};
