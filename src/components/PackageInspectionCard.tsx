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
  /**
   * Propiedad de entrada estrictamente tipada (Tarea 3 — equivalente en React a @Input() pkg: WarehousePackage)
   */
  readonly pkg: WarehousePackage;
  /**
   * Emisor de eventos tipado hacia el contenedor padre (Tarea 3 — equivalente a @Output() statusChange)
   */
  readonly onStatusChange: (event: PackageStatusChangeEvent) => void | Promise<void>;
  /**
   * Acción opcional para eliminar un paquete de Supabase PostgreSQL (RA 5 — CRUD DELETE)
   */
  readonly onDeletePackage?: (id: string) => void | Promise<void>;
  /**
   * Indica si hay una mutación en curso para evitar condiciones de carrera por doble clic
   */
  readonly disabled?: boolean;
  /**
   * Selecciona el paquete en el gemelo digital 3D
   */
  readonly onSelect3D?: (pkg: WarehousePackage) => void;
  readonly isSelected3D?: boolean;
}

const STATUS_LABELS: Record<PackageStatus, string> = {
  IN_TRANSIT: 'EN TRÁNSITO · CINTA',
  INSPECTED: 'INSPECCIONADO · OK',
  REJECTED: 'RECHAZADO · CUARENTENA'
};

const PRIORITY_LABELS: Record<PackagePriority, string> = {
  CRITICAL: 'PRIORIDAD CRÍTICA',
  STANDARD: 'ESTÁNDAR',
  LOW: 'BAJA PRIORIDAD'
};

/**
 * Tarea 3: Componente Visual Reutilizable (Custom Component)
 * Encapsula la representación visual y los controles rápidos de inspección de un paquete
 * sobre la cinta transportadora utilizando componentes oficiales de Ionic Framework v8,
 * interpolación JSX, property binding dinámico y conformidad WCAG 2.1 Nivel AA/AAA.
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
    minute: '2-digit',
    second: '2-digit'
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
          aria-label={`Paquete ${pkg.trackingCode}, destino ${pkg.destinationHub}, estado ${STATUS_LABELS[pkg.status]}`}
        >
          {/* Cabecera técnica: Tracking Code + UUID v4 + Badges con contraste AAA */}
          <div className="lt-card-header">
            <div className="lt-tracking-cluster">
              <span className="lt-bay-tag" title="Sector de cinta transportadora">
                {pkg.aisleBay}
              </span>
              <h3 className="lt-tracking-code">
                <IonIcon icon={cubeOutline} aria-hidden="true" className="lt-inline-icon" />
                {pkg.trackingCode}
              </h3>
              <code className="lt-uuid-pill" title={`Identificador único UUID v4: ${pkg.id}`}>
                UUID v4: {pkg.id}
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

          {/* Cuerpo declarativo: Interpolación de Hub de destino, peso en kg y timestamp */}
          <div className="lt-card-grid">
            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={locationOutline} aria-hidden="true" /> HUB DE DESTINO
              </span>
              <strong className="lt-metric-value">{pkg.destinationHub}</strong>
            </div>

            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={scaleOutline} aria-hidden="true" /> MASA VERIFICADA
              </span>
              <strong className="lt-metric-value lt-tabular-nums">
                {pkg.weightKg.toFixed(2)} kg
              </strong>
            </div>

            <div className="lt-metric-cell">
              <span className="lt-metric-label">
                <IonIcon icon={timeOutline} aria-hidden="true" /> TELEMETRÍA UTC
              </span>
              <strong className="lt-metric-value lt-tabular-nums">
                {formattedDate} · {formattedTime}
              </strong>
            </div>
          </div>

          {pkg.inspectorNotes && (
            <p className="lt-inspector-notes">
              <span className="lt-notes-prefix">NOTA TÉCNICA:</span> {pkg.inspectorNotes}
            </p>
          )}

          {/* Barra de acciones rápidas (Tarea 3: ion-button con checkmark-circle-outline y close-circle-outline) */}
          <div className="lt-card-actions" role="group" aria-label={`Acciones de inspección para ${pkg.trackingCode}`}>
            <IonButton
              fill={pkg.status === 'INSPECTED' ? 'solid' : 'outline'}
              color="success"
              size="default"
              className="lt-action-btn lt-btn-inspect"
              onClick={handleMarkInspected}
              disabled={disabled || pkg.status === 'INSPECTED'}
              aria-label={`INSPECTED · Aprobar paquete ${pkg.trackingCode}`}
              aria-pressed={pkg.status === 'INSPECTED'}
              data-testid={`btn-inspect-${pkg.trackingCode}`}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} aria-hidden="true" />
              INSPECTED
            </IonButton>

            <IonButton
              fill={pkg.status === 'REJECTED' ? 'solid' : 'outline'}
              color="danger"
              size="default"
              className="lt-action-btn lt-btn-reject"
              onClick={handleMarkRejected}
              disabled={disabled || pkg.status === 'REJECTED'}
              aria-label={`REJECTED · Rechazar paquete ${pkg.trackingCode}`}
              aria-pressed={pkg.status === 'REJECTED'}
              data-testid={`btn-reject-${pkg.trackingCode}`}
            >
              <IonIcon slot="start" icon={closeCircleOutline} aria-hidden="true" />
              REJECTED
            </IonButton>

            {pkg.status !== 'IN_TRANSIT' && (
              <IonButton
                fill="clear"
                size="small"
                className="lt-action-btn lt-btn-transit"
                onClick={handleResetTransit}
                disabled={disabled}
                aria-label={`REINICIAR TRÁNSITO · Paquete ${pkg.trackingCode}`}
                data-testid={`btn-transit-${pkg.trackingCode}`}
              >
                <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                REINICIAR TRÁNSITO
              </IonButton>
            )}

            {onSelect3D && (
              <button
                type="button"
                className="lt-btn-3d-focus"
                onClick={() => onSelect3D(pkg)}
                aria-label={`VER EN 3D · Paquete ${pkg.trackingCode}`}
              >
                VER EN 3D
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
                aria-label={`Retirar y eliminar paquete ${pkg.trackingCode} de la base de datos`}
                data-testid={`btn-delete-${pkg.trackingCode}`}
              >
                <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
              </IonButton>
            )}
          </div>
        </article>
      </IonItem>

      {/* Opciones táctiles deslizables de ion-item-sliding (Tarea 2.1) */}
      <IonItemOptions side="end">
        <IonItemOption
          color="success"
          onClick={handleMarkInspected}
          aria-label={`Deslizar para aprobar paquete ${pkg.trackingCode}`}
        >
          <IonIcon slot="start" icon={checkmarkCircleOutline} aria-hidden="true" />
          Aprobar
        </IonItemOption>
        <IonItemOption
          color="danger"
          onClick={handleMarkRejected}
          aria-label={`Deslizar para rechazar paquete ${pkg.trackingCode}`}
        >
          <IonIcon slot="start" icon={closeCircleOutline} aria-hidden="true" />
          Rechazar
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};
