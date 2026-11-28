import React, { useState } from 'react';
import {
  CreatePackageInput,
  generateTrackingCode,
  generateUuidV4,
  isValidTrackingCode,
  isValidUuidV4,
  PackagePriority,
  PackageStatus
} from '../models/package.model';

export interface NewPackageFormProps {
  readonly onCreatePackage: (input: CreatePackageInput) => Promise<boolean>;
  readonly isSubmitting: boolean;
}

interface TouchedFields {
  trackingCode: boolean;
  destinationHub: boolean;
  weightKg: boolean;
  uuid: boolean;
}

/**
 * Formulario de Alta de Nuevo Envío en Cinta (lenguaje 100% orientativo al operario)
 */
export const NewPackageForm: React.FC<NewPackageFormProps> = ({
  onCreatePackage,
  isSubmitting
}) => {
  const [uuid, setUuid] = useState<string>(() => generateUuidV4());
  const [trackingCode, setTrackingCode] = useState<string>(() => generateTrackingCode());
  const [destinationHub, setDestinationHub] = useState<string>('MAD-Cargo Terminal T4');
  const [weightKg, setWeightKg] = useState<string>('14.50');
  const [priority, setPriority] = useState<PackagePriority>('CRITICAL');
  const [status, setStatus] = useState<PackageStatus>('IN_TRANSIT');
  const [aisleBay, setAisleBay] = useState<string>('CONVEYOR-C1 · S04');
  const [inspectorNotes, setInspectorNotes] = useState<string>(
    'Recepción verificada en pórtico de entrada'
  );

  const [touched, setTouched] = useState<TouchedFields>({
    trackingCode: false,
    destinationHub: false,
    weightKg: false,
    uuid: false
  });

  const parsedWeight = Number.parseFloat(weightKg);
  const uuidError = !isValidUuidV4(uuid)
    ? 'El identificador único no tiene un formato válido.'
    : null;
  const trackingError = !isValidTrackingCode(trackingCode)
    ? 'Formato obligatorio: LTK-XXXX-ES (ej. LTK-4821-ES).'
    : null;
  const hubError =
    destinationHub.trim().length < 3
      ? 'Indica un centro de destino válido (mínimo 3 caracteres).'
      : null;
  const weightError =
    Number.isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 9999
      ? 'Introduce un peso válido entre 0.01 kg y 9999 kg.'
      : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setTouched({ trackingCode: true, destinationHub: true, weightKg: true, uuid: true });

    if (uuidError || trackingError || hubError || weightError) {
      return;
    }

    const ok = await onCreatePackage({
      id: uuid.trim(),
      trackingCode: trackingCode.trim().toUpperCase(),
      destinationHub: destinationHub.trim(),
      weightKg: parsedWeight,
      priority,
      status,
      aisleBay: aisleBay.trim(),
      inspectorNotes: inspectorNotes.trim()
    });

    if (ok) {
      setUuid(generateUuidV4());
      setTrackingCode(generateTrackingCode());
      setTouched({ trackingCode: false, destinationHub: false, weightKg: false, uuid: false });
    }
  };

  return (
    <section className="lt-surface-card lt-new-pkg-card" aria-labelledby="new-package-heading">
      <div className="lt-new-pkg-header">
        <div>
          <span className="lt-kicker-accent">ALTA DE MERCANCÍA EN LÍNEA</span>
          <h2 id="new-package-heading" className="lt-section-title">
            Registrar nuevo envío en cinta transportadora
          </h2>
        </div>
        <div className="lt-uuid-actions">
          <button
            type="button"
            className="lt-btn-secondary-surface lt-btn-sm"
            onClick={() => setUuid(generateUuidV4())}
          >
            Nueva referencia
          </button>
          <button
            type="button"
            className="lt-btn-secondary-surface lt-btn-sm"
            onClick={() => setTrackingCode(generateTrackingCode())}
          >
            Generar código
          </button>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="lt-form-grid">
        <div className="lt-field-group">
          <label htmlFor="pkg-uuid">Referencia única del envío</label>
          <input
            id="pkg-uuid"
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, uuid: true }))}
            className="lt-input lt-mono-input"
            required
          />
          {touched.uuid && uuidError && (
            <span className="lt-field-error" role="alert">{uuidError}</span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-tracking">Código de seguimiento (LTK-XXXX-ES)</label>
          <input
            id="pkg-tracking"
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            onBlur={() => setTouched((prev) => ({ ...prev, trackingCode: true }))}
            className="lt-input lt-mono-input"
            placeholder="LTK-5920-ES"
            required
          />
          {touched.trackingCode && trackingError && (
            <span className="lt-field-error" role="alert">{trackingError}</span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-hub">Centro de destino</label>
          <input
            id="pkg-hub"
            type="text"
            value={destinationHub}
            onChange={(e) => setDestinationHub(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, destinationHub: true }))}
            className="lt-input"
            placeholder="MAD-Cargo Terminal T4"
            required
          />
          {touched.destinationHub && hubError && (
            <span className="lt-field-error" role="alert">{hubError}</span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-weight">Peso verificado (kg)</label>
          <input
            id="pkg-weight"
            type="number"
            step="0.05"
            min="0.05"
            max="9999"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, weightKg: true }))}
            className="lt-input lt-tabular-nums"
            required
          />
          {touched.weightKg && weightError && (
            <span className="lt-field-error" role="alert">{weightError}</span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-priority">Prioridad de envío</label>
          <select
            id="pkg-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PackagePriority)}
            className="lt-select"
          >
            <option value="CRITICAL">Crítica (Urgente)</option>
            <option value="STANDARD">Estándar</option>
            <option value="LOW">Baja (Consolidación)</option>
          </select>
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-status">Estado inicial</label>
          <select
            id="pkg-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PackageStatus)}
            className="lt-select"
          >
            <option value="IN_TRANSIT">En cinta</option>
            <option value="INSPECTED">Aprobado</option>
            <option value="REJECTED">Cuarentena</option>
          </select>
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-bay">Sector / Bahía</label>
          <input
            id="pkg-bay"
            type="text"
            value={aisleBay}
            onChange={(e) => setAisleBay(e.target.value)}
            className="lt-input"
          />
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-notes">Observaciones</label>
          <input
            id="pkg-notes"
            type="text"
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            className="lt-input"
          />
        </div>

        <div className="lt-form-submit-row">
          <button
            type="submit"
            className="lt-btn-primary-solid"
            disabled={isSubmitting}
            data-testid="btn-create-package"
          >
            {isSubmitting ? 'Guardando envío...' : 'Registrar envío en línea'}
          </button>
        </div>
      </form>
    </section>
  );
};
