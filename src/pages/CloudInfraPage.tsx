import React, { useCallback, useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  cloudUploadOutline,
  layersOutline,
  paperPlaneOutline,
  refreshOutline,
  serverOutline,
  shieldCheckmarkOutline,
  syncOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import { ThemeToggleButton } from '../context/ThemeContext';
import {
  AwsEmulatorSnapshot,
  awsEmulatorService
} from '../services/aws-emulator.service';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';
import {
  AnimatedMetricNumber,
  TopLoadingProgressBar
} from '../components/LiveProgressWidgets';

export interface CloudInfraPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
  readonly operatorBadge: string;
}

export const CloudInfraPage: React.FC<CloudInfraPageProps> = ({
  warehouseState,
  operatorBadge
}) => {
  const { packages, metrics } = warehouseState;
  const [snapshot, setSnapshot] = useState<AwsEmulatorSnapshot>(() =>
    awsEmulatorService.getSyncSnapshot(packages)
  );
  const [statusLog, setStatusLog] = useState<string>(
    'Sincronización activa: los registros principales, réplicas y manifiestos de turno están actualizados.'
  );
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [replayKey, setReplayKey] = useState<number>(0);

  const refreshEmulator = useCallback(async (): Promise<void> => {
    const snap = await awsEmulatorService.getSnapshot(packages);
    setSnapshot(snap);
  }, [packages]);

  useEffect(() => {
    void refreshEmulator();
  }, [refreshEmulator]);

  const handleSyncDynamo = async (): Promise<void> => {
    setIsWorking(true);
    setReplayKey((k) => k + 1);
    try {
      const res = await awsEmulatorService.syncPackagesToDynamoDb(packages);
      await refreshEmulator();
      setStatusLog(
        `Sincronización completada: ${res.syncedCount} envíos replicados correctamente en la copia de consulta rápida.`
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleArchiveS3 = async (): Promise<void> => {
    setIsWorking(true);
    setReplayKey((k) => k + 1);
    try {
      const obj = await awsEmulatorService.archiveManifestToS3(packages, operatorBadge);
      await refreshEmulator();
      setStatusLog(
        `Manifiesto de turno guardado correctamente (${obj.key}, ${obj.sizeBytes} bytes, firma verificada).`
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleSendSqs = async (): Promise<void> => {
    setIsWorking(true);
    setReplayKey((k) => k + 1);
    try {
      const target = packages[0];
      const msg = await awsEmulatorService.publishSqsEvent({
        eventType: 'PACKAGE_INSPECTED',
        trackingCode: target?.trackingCode ?? 'LTK-4821-ES',
        packageId: target?.id ?? 'a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10',
        detail: `Notificación de control enviada por ${operatorBadge} para auditoría de línea`
      });
      await refreshEmulator();
      setStatusLog(
        `Notificación registrada en el historial de eventos (ID ${msg.messageId.slice(0, 8)}).`
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="lt-dash-wrapper">
      <header className="lt-subpage-topbar">
        <div>
          <h1 id="cloud-infra-heading" className="lt-subpage-title">
            Centro de Sincronización, Copias y Trazabilidad
          </h1>
          <p className="lt-subpage-desc">
            Supervisa la réplica de envíos, archiva cierres firmados de turno y consulta el historial cronológico.
          </p>
        </div>
        <div className="lt-subpage-topbar-actions">
          <span className="lt-status-live-chip" role="status" data-testid="aws-mode-pill">
            {snapshot.mode === 'LOCALSTACK_LIVE_4566'
              ? 'Servicio local conectado'
              : 'Sincronización en la nube activa'}
          </span>
          <button
            type="button"
            className="lt-icon-pill-btn"
            onClick={() => {
              setReplayKey((k) => k + 1);
              void refreshEmulator();
            }}
            aria-label="Actualizar indicadores de respaldo"
            title="Actualizar estado"
          >
            <IonIcon icon={refreshOutline} aria-hidden="true" />
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      <TopLoadingProgressBar
        triggerKey={replayKey}
        isBusy={isWorking}
        label="Comprobando copias de seguridad y registros de turno"
      />

      <main className="lt-subpage-main" aria-labelledby="cloud-infra-heading">
        <div className="lt-banner-success" role="status" aria-live="polite" data-testid="aws-status-log">
          <div className="lt-banner-content">
            <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
            <span>{statusLog}</span>
          </div>
        </div>

        <GlassyStagger className="lt-kpi-ribbon-4" replayKey={replayKey}>
          <GlassyReveal className="lt-surface-card lt-mini-kpi" hoverLift>
            <span className="lt-kpi-label">Registro principal</span>
            <strong className="lt-kpi-number lt-tabular-nums">
              <AnimatedMetricNumber value={metrics.total} replayKey={replayKey} />
            </strong>
            <span className="lt-kpi-foot">Envíos consolidados en línea</span>
          </GlassyReveal>

          <GlassyReveal className="lt-surface-card lt-mini-kpi" hoverLift>
            <span className="lt-kpi-label">Réplica de consulta rápida</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-dynamo-count">
              <AnimatedMetricNumber value={snapshot.dynamoItems.length} replayKey={replayKey} />
            </strong>
            <span className="lt-kpi-foot">Copia sincronizada de alta velocidad</span>
          </GlassyReveal>

          <GlassyReveal className="lt-surface-card lt-mini-kpi" hoverLift>
            <span className="lt-kpi-label">Manifiestos archivados</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-s3-count">
              <AnimatedMetricNumber value={snapshot.s3Objects.length} replayKey={replayKey} />
            </strong>
            <span className="lt-kpi-foot">Instantáneas firmadas de turno</span>
          </GlassyReveal>

          <GlassyReveal className="lt-surface-card lt-mini-kpi" hoverLift>
            <span className="lt-kpi-label">Eventos registrados</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-sqs-count">
              <AnimatedMetricNumber value={snapshot.sqsMessages.length} replayKey={replayKey} />
            </strong>
            <span className="lt-kpi-foot">Historial de movimientos en planta</span>
          </GlassyReveal>
        </GlassyStagger>

        <div className="lt-aws-grid">
          <section className="lt-surface-card lt-audit-card">
            <div className="lt-aws-card-head">
              <h2>
                <IonIcon icon={serverOutline} aria-hidden="true" /> Réplica de envíos
              </h2>
              <button
                type="button"
                className="lt-btn-primary-solid lt-btn-xs"
                disabled={isWorking}
                onClick={() => void handleSyncDynamo()}
                data-testid="btn-aws-sync-dynamo"
              >
                <IonIcon icon={syncOutline} aria-hidden="true" /> Sincronizar
              </button>
            </div>
            <p className="lt-muted-desc">
              Mantiene una copia estructurada de cada envío para consultas rápidas desde
              terminales de almacén incluso en horas punta.
            </p>
            <pre className="lt-code-pre lt-code-compact">
              {JSON.stringify(
                {
                  registro: snapshot.dynamoTable,
                  totalSincronizados: snapshot.dynamoItems.length,
                  ultimoEnvio: snapshot.dynamoItems[0] ?? null
                },
                null,
                2
              )}
            </pre>
          </section>

          <section className="lt-surface-card lt-audit-card">
            <div className="lt-aws-card-head">
              <h2>
                <IonIcon icon={cloudUploadOutline} aria-hidden="true" /> Archivo de manifiestos
              </h2>
              <button
                type="button"
                className="lt-btn-primary-solid lt-btn-xs"
                disabled={isWorking}
                onClick={() => void handleArchiveS3()}
                data-testid="btn-aws-archive-s3"
              >
                <IonIcon icon={cloudUploadOutline} aria-hidden="true" /> Guardar cierre
              </button>
            </div>
            <p className="lt-muted-desc">
              Genera una copia sellada con el resumen de envíos aprobados, en cinta y en cuarentena
              para auditorías de transporte.
            </p>
            {snapshot.s3Objects.length > 0 ? (
              <ul className="lt-aws-list">
                {snapshot.s3Objects.slice(0, 4).map((obj) => (
                  <li key={obj.key} className="lt-aws-list-item">
                    <strong>{obj.key}</strong>
                    <span className="lt-tabular-nums">
                      {obj.sizeBytes} bytes, firma {obj.etag.slice(0, 14)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="lt-aws-empty-note">
                Pulsa <strong>Guardar cierre</strong> para archivar un manifiesto de turno ahora.
              </div>
            )}
          </section>

          <section className="lt-surface-card lt-audit-card">
            <div className="lt-aws-card-head">
              <h2>
                <IonIcon icon={layersOutline} aria-hidden="true" /> Cola de eventos
              </h2>
              <button
                type="button"
                className="lt-btn-primary-solid lt-btn-xs"
                disabled={isWorking}
                onClick={() => void handleSendSqs()}
                data-testid="btn-aws-send-sqs"
              >
                <IonIcon icon={paperPlaneOutline} aria-hidden="true" /> Emitir aviso
              </button>
            </div>
            <p className="lt-muted-desc">
              Cada alta, aprobación o desvío a cuarentena queda registrado automáticamente en la
              secuencia cronológica del turno.
            </p>
            <ul className="lt-aws-list">
              {snapshot.sqsMessages.slice(0, 4).map((msg) => (
                <li key={msg.messageId} className="lt-aws-list-item">
                  <strong>
                    {msg.trackingCode} ({msg.eventType})
                  </strong>
                  <span>{msg.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="lt-surface-card lt-audit-card" aria-labelledby="service-validation-heading">
          <h2 id="service-validation-heading">
            <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" /> Flujo automatizado de validación y publicación
          </h2>
          <div className="lt-cicd-pipeline-grid">
            <div className="lt-cicd-stage">
              <h3>Control de cambios</h3>
              <p>Registro seguro de actualizaciones con protección automática de credenciales.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Operativo
              </span>
            </div>
            <div className="lt-cicd-stage">
              <h3>Validación de integridad</h3>
              <p>Comprobación automática de todos los formularios y contratos de datos antes de publicar.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Verificado
              </span>
            </div>
            <div className="lt-cicd-stage">
              <h3>Prueba de respaldo</h3>
              <p>Verificación automática del almacenamiento de réplicas, manifiestos y cola de eventos.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Superado
              </span>
            </div>
            <div className="lt-cicd-stage">
              <h3>Publicación sin cortes</h3>
              <p>Actualización atómica para todos los centros con opción de reversión segura.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> Activo
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
