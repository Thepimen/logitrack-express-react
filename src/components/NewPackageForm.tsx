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
 * Formulario Controlado de Alta de Paquete en Cinta Transportadora (RA 2, RA 3, RA 5)
 * - Validación progresiva: solo muestra errores tras interacción (onBlur) o intento de envío,
 *   nunca punitivo desde el primer carácter.
 * - Demuestra la generación criptográfica de UUID v4 (`crypto.randomUUID()`) frente a IDs secuenciales.
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
    'Recepción verificada mediante pórtico láser RFID'
  );

  const [touched, setTouched] = useState<TouchedFields>({
    trackingCode: false,
    destinationHub: false,
    weightKg: false,
    uuid: false
  });

  const parsedWeight = Number.parseFloat(weightKg);
  const uuidError = !isValidUuidV4(uuid)
    ? 'El UUID debe cumplir el formato RFC 9562 v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).'
    : null;
  const trackingError = !isValidTrackingCode(trackingCode)
    ? 'Formato obligatorio: LTK-XXXX-ES (4 dígitos centrales, ej. LTK-4821-ES).'
    : null;
  const hubError =
    destinationHub.trim().length < 3
      ? 'Indique un Hub logístico válido (mínimo 3 caracteres).'
      : null;
  const weightError =
    Number.isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 9999
      ? 'Introduzca un peso numérico entre 0.01 kg y 9999 kg.'
      : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setTouched({
      trackingCode: true,
      destinationHub: true,
      weightKg: true,
      uuid: true
    });

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
      setTouched({
        trackingCode: false,
        destinationHub: false,
        weightKg: false,
        uuid: false
      });
    }
  };

  return (
    <section
      className="lt-new-pkg-card"
      aria-labelledby="new-package-heading"
    >
      <div className="lt-new-pkg-header">
        <div>
          <span className="lt-section-kicker">PERSISTENCIA REAL SUPABASE POSTGRESQL (INSERT)</span>
          <h2 id="new-package-heading" className="lt-section-title">
            Inyección de Paquete en Cinta Transportadora (Generador UUID v4)
          </h2>
        </div>
        <div className="lt-uuid-actions">
          <button
            type="button"
            className="lt-secondary-btn"
            onClick={() => setUuid(generateUuidV4())}
          >
            REGENERAR UUID v4
          </button>
          <button
            type="button"
            className="lt-secondary-btn"
            onClick={() => setTrackingCode(generateTrackingCode())}
          >
            NUEVO CÓDIGO LTK
          </button>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="lt-form-grid">
        <div className="lt-field-group">
          <label htmlFor="pkg-uuid">ID Primario Criptográfico (UUID v4 · 128 bits)</label>
          <input
            id="pkg-uuid"
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, uuid: true }))}
            aria-invalid={touched.uuid && Boolean(uuidError)}
            aria-describedby={touched.uuid && uuidError ? 'err-pkg-uuid' : undefined}
            className="lt-input lt-mono-input"
            required
          />
          {touched.uuid && uuidError && (
            <span id="err-pkg-uuid" className="lt-field-error" role="alert">
              {uuidError}
            </span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-tracking">Tracking Code (Formato LTK-XXXX-ES)</label>
          <input
            id="pkg-tracking"
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            onBlur={() => setTouched((prev) => ({ ...prev, trackingCode: true }))}
            aria-invalid={touched.trackingCode && Boolean(trackingError)}
            aria-describedby={touched.trackingCode && trackingError ? 'err-pkg-tracking' : undefined}
            className="lt-input lt-mono-input"
            placeholder="LTK-5920-ES"
            required
          />
          {touched.trackingCode && trackingError && (
            <span id="err-pkg-tracking" className="lt-field-error" role="alert">
              {trackingError}
            </span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-hub">Hub Logístico de Destino</label>
          <input
            id="pkg-hub"
            type="text"
            value={destinationHub}
            onChange={(e) => setDestinationHub(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, destinationHub: true }))}
            aria-invalid={touched.destinationHub && Boolean(hubError)}
            aria-describedby={touched.destinationHub && hubError ? 'err-pkg-hub' : undefined}
            className="lt-input"
            placeholder="MAD-Cargo Terminal T4"
            required
          />
          {touched.destinationHub && hubError && (
            <span id="err-pkg-hub" className="lt-field-error" role="alert">
              {hubError}
            </span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-weight">Peso en Báscula Dinámica (kg)</label>
          <input
            id="pkg-weight"
            type="number"
            step="0.05"
            min="0.05"
            max="9999"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, weightKg: true }))}
            aria-invalid={touched.weightKg && Boolean(weightError)}
            aria-describedby={touched.weightKg && weightError ? 'err-pkg-weight' : undefined}
            className="lt-input lt-tabular-nums"
            required
          />
          {touched.weightKg && weightError && (
            <span id="err-pkg-weight" className="lt-field-error" role="alert">
              {weightError}
            </span>
          )}
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-priority">Nivel de Prioridad SLA</label>
          <select
            id="pkg-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PackagePriority)}
            className="lt-select"
          >
            <option value="CRITICAL">CRITICAL (Urgente / Termolábil)</option>
            <option value="STANDARD">STANDARD (Línea Regular)</option>
            <option value="LOW">LOW (Consolidación Carga)</option>
          </select>
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-status">Estado Inicial de Recepción</label>
          <select
            id="pkg-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PackageStatus)}
            className="lt-select"
          >
            <option value="IN_TRANSIT">IN_TRANSIT (En Cinta Transportadora)</option>
            <option value="INSPECTED">INSPECTED (Inspección Aprobada)</option>
            <option value="REJECTED">REJECTED (Cuarentena / Rechazado)</option>
          </select>
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-bay">Sector de Cinta / Bahía</label>
          <input
            id="pkg-bay"
            type="text"
            value={aisleBay}
            onChange={(e) => setAisleBay(e.target.value)}
            className="lt-input"
          />
        </div>

        <div className="lt-field-group">
          <label htmlFor="pkg-notes">Observaciones de Inspección</label>
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
            className="lt-primary-submit-btn"
            disabled={isSubmitting}
            data-testid="btn-create-package"
          >
            {isSubmitting ? 'SINCRONIZANDO CON SUPABASE...' : 'REGISTRAR PAQUETE EN CINTA (INSERT)'}
          </button>
        </div>
      </form>
    </section>
  );
};
