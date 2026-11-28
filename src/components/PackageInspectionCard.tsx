import React from 'react';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  cubeOutline,
  locationOutline,
  refreshOutline,
  scaleOutline,
  timeOutline,
  trashOutline
} from 'ionicons/icons';
import {
  PackagePriority,
  PackageStatus,
  PackageStatusChangeEvent,
  WarehousePackage
} from '../models/package.model';

export interface PackageInspectionCardProps {
  readonly pkg: WarehousePackage;
  readonly onStatusChange: (event: PackageStatusChangeEvent) => void | Promise<void>;
  readonly onDeletePackage?: (id: string) => void | Promise<void>;
  readonly disabled?: boolean;
  readonly onSelect3D?: (pkg: WarehousePackage) => void;
  readonly isSelected3D?: boolean;
}

const STATUS_LABELS: Record<PackageStatus, string> = {
  IN_TRANSIT: 'En cinta',
  INSPECTED: 'Aprobado',
  REJECTED: 'Cuarentena'
};

const PRIORITY_LABELS: Record<PackagePriority, string> = {
  CRITICAL: 'Crítica',
  STANDARD: 'Estándar',
  LOW: 'Baja'
};

/**
 * Componente Visual Reutilizable de Tarjeta de Envío (Tarea 3)
 * - Totalmente desacoplado de la capa de servicios.
 * - Utiliza IonItemSliding, IonItem, IonBadge e IonButton oficiales con iconos
 *   checkmark-circle-outline y close-circle-outline para clasificar como INSPECTED o REJECTED.
 */
export const PackageInspectionCard: React.FC<PackageInspectionCardProps> = ({
  pkg,
  onStatusChange,
  onDeletePackage,
  disabled = false,
  onSelect3D,
  isSelected3D = false
}) => {
  const formattedTime = pkg.timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedDate = pkg.timestamp.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleMarkInspected = (): void => {
    void onStatusChange({ id: pkg.id, newStatus: 'INSPECTED' });
  };

  const handleMarkRejected = (): void => {
    void onStatusChange({ id: pkg.id, newStatus: 'REJECTED' });
  };

  const handleResetTransit = (): void => {
    void onStatusChange({ id: pkg.id, newStatus: 'IN_TRANSIT' });
  };

  return (
    <IonItemSliding className="lt-sliding-wrapper">
      <IonItem
        lines="none"
        className={`lt-package-item lt-status-${pkg.status.toLowerCase()} lt-priority-border-${pkg.priority.toLowerCase()} ${
          isSelected3D ? 'lt-selected-3d' : ''
        }`}
        data-testid={`package-card-${pkg.trackingCode}`}
        data-status={pkg.status}
        data-priority={pkg.priority}
      >
        <article
          className="lt-card-surface"
          aria-label={`Envío ${pkg.trackingCode}, destino ${pkg.destinationHub}, estado ${STATUS_LABELS[pkg.status]}`}
        >
          <div className="lt-card-header">
            <div className="lt-tracking-cluster">
              <span className="lt-bay-tag" title="Sector de línea">
                {pkg.aisleBay.replace(/\s*[·•]\s*/g, ' / ')}
              </span>
              <h3 className="lt-tracking-code">
                <IonIcon icon={cubeOutline} aria-hidden="true" className="lt-inline-icon" />
                {pkg.trackingCode}
              </h3>
              <code className="lt-uuid-pill" title={`Referencia única: ${pkg.id}`}>
                Ref: {pkg.id.slice(0, 13)}…
              </code>
            </div>

            <div className="lt-badges-cluster">
              <IonBadge
                className={`lt-badge lt-badge-priority-${pkg.priority.toLowerCase()}`}
                aria-label={`Prioridad: ${PRIORITY_LABELS[pkg.priority]}`}
              >
                {PRIORITY_LABELS[pkg.priority]}
              </IonBadge>
              <IonBadge
                className={`lt-badge lt-badge-status-${pkg.status.toLowerCase()}`}
                aria-label={`Estado actual: ${STATUS_LABELS[pkg.status]}`}
              >
                {STATUS_LABELS[pkg.status]}
              </IonBadge>
            </div>
          </div>

          <div className="lt-card-grid">
            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={locationOutline} aria-hidden="true" /> Destino
              </span>
              <strong className="lt-metric-value">{pkg.destinationHub}</strong>
            </div>

            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={scaleOutline} aria-hidden="true" /> Peso
              </span>
              <strong className="lt-metric-value lt-tabular-nums">
                {pkg.weightKg.toFixed(2)} kg
              </strong>
            </div>

            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={timeOutline} aria-hidden="true" /> Registro
              </span>
              <strong className="lt-metric-value lt-tabular-nums">
                {formattedDate}, {formattedTime}
              </strong>
            </div>
          </div>

          {pkg.inspectorNotes && (
            <p className="lt-inspector-notes">
              <span className="lt-notes-prefix">Observación:</span> {pkg.inspectorNotes}
            </p>
          )}

          <div className="lt-card-actions" role="group" aria-label={`Acciones para envío ${pkg.trackingCode}`}>
            <IonButton
              fill={pkg.status === 'INSPECTED' ? 'solid' : 'outline'}
              color="success"
              size="small"
              className="lt-action-btn lt-btn-inspect"
              onClick={handleMarkInspected}
              disabled={disabled || pkg.status === 'INSPECTED'}
              aria-label={`Aprobar envío ${pkg.trackingCode}`}
              aria-pressed={pkg.status === 'INSPECTED'}
              data-testid={`btn-inspect-${pkg.trackingCode}`}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} aria-hidden="true" />
              Aprobar
            </IonButton>

            <IonButton
              fill={pkg.status === 'REJECTED' ? 'solid' : 'outline'}
              color="danger"
              size="small"
              className="lt-action-btn lt-btn-reject"
              onClick={handleMarkRejected}
              disabled={disabled || pkg.status === 'REJECTED'}
              aria-label={`Rechazar envío ${pkg.trackingCode}`}
              aria-pressed={pkg.status === 'REJECTED'}
              data-testid={`btn-reject-${pkg.trackingCode}`}
            >
              <IonIcon slot="start" icon={closeCircleOutline} aria-hidden="true" />
              Rechazar
            </IonButton>

            {pkg.status !== 'IN_TRANSIT' && (
              <IonButton
                fill="clear"
                size="small"
                className="lt-action-btn lt-btn-transit"
                onClick={handleResetTransit}
                disabled={disabled}
                aria-label={`Devolver a cinta envío ${pkg.trackingCode}`}
                data-testid={`btn-transit-${pkg.trackingCode}`}
              >
                <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                Devolver a cinta
              </IonButton>
            )}

            {onSelect3D && (
              <button
                type="button"
                className="lt-btn-3d-focus"
                onClick={() => onSelect3D(pkg)}
                aria-label={`Ver en 3D envío ${pkg.trackingCode}`}
              >
                Ver en 3D
              </button>
            )}

            {onDeletePackage && (
              <IonButton
                fill="clear"
                color="medium"
                size="small"
                className="lt-action-btn lt-btn-delete"
                onClick={() => void onDeletePackage(pkg.id)}
                disabled={disabled}
                aria-label={`Eliminar envío ${pkg.trackingCode}`}
                data-testid={`btn-delete-${pkg.trackingCode}`}
              >
                <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
              </IonButton>
            )}
          </div>
        </article>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption
          color="success"
          onClick={handleMarkInspected}
          aria-label={`Deslizar para aprobar envío ${pkg.trackingCode}`}
        >
          <IonIcon slot="start" icon={checkmarkCircleOutline} aria-hidden="true" />
          Aprobar
        </IonItemOption>
        <IonItemOption
          color="danger"
          onClick={handleMarkRejected}
          aria-label={`Deslizar para rechazar envío ${pkg.trackingCode}`}
        >
          <IonIcon slot="start" icon={closeCircleOutline} aria-hidden="true" />
          Rechazar
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};
