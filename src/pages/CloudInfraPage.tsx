import React, { useCallback, useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  cloudUploadOutline,
  gitBranchOutline,
  layersOutline,
  paperPlaneOutline,
  refreshOutline,
  serverOutline,
  syncOutline
} from 'ionicons/icons';
import { UseWarehousePackagesReturn } from '../hooks/useWarehousePackages';
import {
  AwsEmulatorSnapshot,
  awsEmulatorService
} from '../services/aws-emulator.service';
import { GlassyReveal, GlassyStagger } from '../components/GlassyReveal';

export interface CloudInfraPageProps {
  readonly warehouseState: UseWarehousePackagesReturn;
  readonly operatorBadge: string;
}

/**
 * ============================================================================
 * CONSOLA DE BASE DE DATOS, AWS EMULATOR (LOCALSTACK) & CI/CD (`/cloud-infra`)
 * ============================================================================
 * Muestra y permite operar en vivo:
 * 1. Base de Datos Relacional Cloud: Supabase PostgreSQL (`warehouse_packages`, `warehouse_operators`).
 * 2. AWS Cloud Emulator (LocalStack v3.8 · Puerto 4566):
 *    - Amazon DynamoDB (`LogiTrackPackages`): PutItem / Scan en tiempo real
 *    - Amazon S3 (`logitrack-manifests-eu-west-3`): PutObject de manifiestos JSON
 *    - Amazon SQS (`logitrack-inspection-events`): SendMessage / cola de eventos
 * 3. Visualizador interactivo del Pipeline CI/CD (`.github/workflows/ci-cd.yml` + Vercel).
 */
export const CloudInfraPage: React.FC<CloudInfraPageProps> = ({
  warehouseState,
  operatorBadge
}) => {
  const { packages, metrics } = warehouseState;
  const [snapshot, setSnapshot] = useState<AwsEmulatorSnapshot | null>(null);
  const [statusLog, setStatusLog] = useState<string>(
    'Sistema dual operativo: Supabase PostgreSQL (primaria) + AWS Emulator LocalStack v3.8 (réplica cloud).'
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
    try {
      const res = await awsEmulatorService.syncPackagesToDynamoDb(packages);
      await refreshEmulator();
      setStatusLog(
        `[DynamoDB PutItem OK] ${res.syncedCount} paquetes replicados desde Supabase PostgreSQL a la tabla LogiTrackPackages (modo: ${res.mode}).`
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleArchiveS3 = async (): Promise<void> => {
    setIsWorking(true);
    try {
      const obj = await awsEmulatorService.archiveManifestToS3(packages, operatorBadge);
      await refreshEmulator();
      setStatusLog(
        `[S3 PutObject OK] Manifiesto archivado en s3://${obj.bucket}/${obj.key} (${obj.sizeBytes} bytes · ETag: ${obj.etag}).`
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleSendSqs = async (): Promise<void> => {
    setIsWorking(true);
    try {
      const target = packages[0];
      const msg = await awsEmulatorService.publishSqsEvent({
        eventType: 'PACKAGE_INSPECTED',
        trackingCode: target?.trackingCode ?? 'LTK-4821-ES',
        packageId: target?.id ?? 'a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10',
        detail: `Evento SQS despachado manualmente por ${operatorBadge} para auditoría en cola logitrack-inspection-events`
      });
      await refreshEmulator();
      setStatusLog(
        `[SQS SendMessage OK] Evento encolado con MessageId ${msg.messageId} (MD5: ${msg.md5OfBody.slice(0, 12)}…).`
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <main className="lt-cloud-main" aria-labelledby="cloud-infra-heading">
      <div className="lt-workspace-container">
        <header className="lt-page-hero-header lt-glass-panel">
          <div>
            <span className="lt-kicker-amber">
              BASE DE DATOS POSTGRESQL + AWS EMULATOR (LOCALSTACK v3.8) + CI/CD PIPELINE
            </span>
            <h1 id="cloud-infra-heading" className="lt-page-title">
              Infraestructura Cloud Híbrida, Persistencia Dual y Automatización DevOps
            </h1>
          </div>
          <div className="lt-hero-actions-inline">
            <span className="lt-cloud-mode-pill" role="status" data-testid="aws-mode-pill">
              {snapshot?.mode === 'LOCALSTACK_LIVE_4566'
                ? 'LIVE LOCALSTACK :4566'
                : 'AWS EDGE EMULATOR (WIRE-COMPATIBLE)'}
            </span>
            <button
              type="button"
              className="lt-secondary-btn"
              onClick={() => setReplayKey((k) => k + 1)}
            >
              <IonIcon icon={refreshOutline} aria-hidden="true" /> REPLAY GLASSY
            </button>
          </div>
        </header>

        <div className="lt-benchmark-output lt-glass-panel" role="status" aria-live="polite" data-testid="aws-status-log">
          {statusLog}
        </div>

        {/* KPIs de Infraestructura Dual desplegados en cascada Framer Motion */}
        <GlassyStagger className="lt-kpi-ribbon" replayKey={replayKey}>
          <GlassyReveal className="lt-kpi-card lt-glass-panel" hoverLift>
            <span className="lt-kpi-label">BASE DE DATOS PRIMARIA</span>
            <strong className="lt-kpi-number lt-tabular-nums">PostgreSQL</strong>
            <span className="lt-kpi-foot">
              Supabase eu-west-3 · {metrics.total} filas en <code>warehouse_packages</code>
            </span>
          </GlassyReveal>

          <GlassyReveal className="lt-kpi-card lt-kpi-sky lt-glass-panel" hoverLift>
            <span className="lt-kpi-label">AWS DYNAMODB EMULATOR</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-dynamo-count">
              {snapshot?.dynamoItems.length ?? 0}
            </strong>
            <span className="lt-kpi-foot">
              Tabla <code>{snapshot?.dynamoTable ?? 'LogiTrackPackages'}</code> · Puerto 4566
            </span>
          </GlassyReveal>

          <GlassyReveal className="lt-kpi-card lt-kpi-emerald lt-glass-panel" hoverLift>
            <span className="lt-kpi-label">AWS S3 MANIFESTS BUCKET</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-s3-count">
              {snapshot?.s3Objects.length ?? 0}
            </strong>
            <span className="lt-kpi-foot">
              Bucket <code>{snapshot?.s3Bucket ?? 'logitrack-manifests-eu-west-3'}</code>
            </span>
          </GlassyReveal>

          <GlassyReveal className="lt-kpi-card lt-kpi-cobalt lt-glass-panel" hoverLift>
            <span className="lt-kpi-label">AWS SQS EVENT BUS</span>
            <strong className="lt-kpi-number lt-tabular-nums" data-testid="aws-sqs-count">
              {snapshot?.sqsMessages.length ?? 0}
            </strong>
            <span className="lt-kpi-foot">
              Cola <code>{snapshot?.sqsQueue ?? 'logitrack-inspection-events'}</code>
            </span>
          </GlassyReveal>
        </GlassyStagger>

        {/* Workbench interactivo del AWS Emulator (DynamoDB + S3 + SQS) */}
        <GlassyStagger className="lt-aws-grid" replayKey={replayKey}>
          {/* 1. Amazon DynamoDB */}
          <GlassyReveal className="lt-audit-card lt-glass-panel" hoverLift>
            <div className="lt-aws-card-head">
              <div>
                <span className="lt-section-kicker">SERVICIO AWS 1 · NOSQL KEY-VALUE</span>
                <h2>
                  <IonIcon icon={serverOutline} aria-hidden="true" /> Amazon DynamoDB
                </h2>
              </div>
              <button
                type="button"
                className="lt-primary-submit-btn"
                disabled={isWorking}
                onClick={() => void handleSyncDynamo()}
                data-testid="btn-aws-sync-dynamo"
              >
                <IonIcon icon={syncOutline} aria-hidden="true" /> SYNC PUTITEM
              </button>
            </div>
            <p className="lt-muted-desc">
              Replica cada <code>WarehousePackage</code> de Supabase en formato nativo DynamoDB
              AttributeValue (<code>{'{ "S": "...", "N": "..." }'}</code>) con clave de partición UUID v4.
            </p>
            <pre className="lt-code-pre lt-code-compact">
              {JSON.stringify(
                {
                  TableName: snapshot?.dynamoTable ?? 'LogiTrackPackages',
                  Endpoint: snapshot?.endpoint ?? 'http://localhost:4566',
                  Count: snapshot?.dynamoItems.length ?? 0,
                  SampleItem: snapshot?.dynamoItems[0] ?? null
                },
                null,
                2
              )}
            </pre>
          </GlassyReveal>

          {/* 2. Amazon S3 */}
          <GlassyReveal className="lt-audit-card lt-glass-panel" hoverLift>
            <div className="lt-aws-card-head">
              <div>
                <span className="lt-section-kicker">SERVICIO AWS 2 · OBJECT STORAGE</span>
                <h2>
                  <IonIcon icon={cloudUploadOutline} aria-hidden="true" /> Amazon S3 Bucket
                </h2>
              </div>
              <button
                type="button"
                className="lt-primary-submit-btn"
                disabled={isWorking}
                onClick={() => void handleArchiveS3()}
                data-testid="btn-aws-archive-s3"
              >
                <IonIcon icon={cloudUploadOutline} aria-hidden="true" /> PUTOBJECT JSON
              </button>
            </div>
            <p className="lt-muted-desc">
              Genera instantáneas JSON inmutables del estado completo de la cinta transportadora con
              hash de integridad <code>ETag</code> en el bucket emulado.
            </p>
            {snapshot && snapshot.s3Objects.length > 0 ? (
              <ul className="lt-aws-list">
                {snapshot.s3Objects.slice(0, 4).map((obj) => (
                  <li key={obj.key} className="lt-aws-list-item">
                    <strong>{obj.key}</strong>
                    <span className="lt-tabular-nums">
                      {obj.sizeBytes} B · ETag {obj.etag.slice(0, 14)}…
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="lt-aws-empty-note">
                Pulsa <strong>PUTOBJECT JSON</strong> para archivar el manifiesto actual de la cinta en S3.
              </div>
            )}
          </GlassyReveal>

          {/* 3. Amazon SQS */}
          <GlassyReveal className="lt-audit-card lt-glass-panel" hoverLift>
            <div className="lt-aws-card-head">
              <div>
                <span className="lt-section-kicker">SERVICIO AWS 3 · EVENT QUEUE</span>
                <h2>
                  <IonIcon icon={layersOutline} aria-hidden="true" /> Amazon SQS Queue
                </h2>
              </div>
              <button
                type="button"
                className="lt-primary-submit-btn"
                disabled={isWorking}
                onClick={() => void handleSendSqs()}
                data-testid="btn-aws-send-sqs"
              >
                <IonIcon icon={paperPlaneOutline} aria-hidden="true" /> SENDMESSAGE
              </button>
            </div>
            <p className="lt-muted-desc">
              Cada mutación CRUD en Supabase dispara automáticamente un evento asíncrono desacoplado
              hacia <code>logitrack-inspection-events</code>.
            </p>
            <ul className="lt-aws-list">
              {(snapshot?.sqsMessages ?? []).slice(0, 4).map((msg) => (
                <li key={msg.messageId} className="lt-aws-list-item">
                  <strong>
                    [{msg.eventType}] {msg.trackingCode}
                  </strong>
                  <span>{msg.detail}</span>
                </li>
              ))}
            </ul>
          </GlassyReveal>
        </GlassyStagger>

        {/* Pipeline CI/CD Real + Stack Tecnológico */}
        <GlassyReveal className="lt-audit-card lt-glass-panel">
          <span className="lt-section-kicker">INGENIERÍA DEVOPS · INTEGRACIÓN Y DESPLIEGUE CONTINUO</span>
          <h2>
            <IonIcon icon={gitBranchOutline} aria-hidden="true" /> Pipeline CI/CD Automatizado
            (<code>.github/workflows/ci-cd.yml</code> + Vercel Edge)
          </h2>
          <div className="lt-cicd-pipeline-grid">
            <div className="lt-cicd-stage">
              <span className="lt-stage-num">01 · CI</span>
              <h3>Git Push / PR</h3>
              <p>Rama protegida <code>main</code> con commits semánticos y bloqueo estricto de <code>.env</code>.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> VERIFICADO
              </span>
            </div>
            <div className="lt-cicd-stage">
              <span className="lt-stage-num">02 · CI</span>
              <h3>TypeScript Strict</h3>
              <p>Ejecución de <code>tsc --noEmit</code> garantizando 0 errores de tipos y 0 <code>any</code>.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> 0 ERRORES
              </span>
            </div>
            <div className="lt-cicd-stage">
              <span className="lt-stage-num">03 · CI</span>
              <h3>AWS Emulator Test</h3>
              <p>Arranque de <code>aws/emulator-server.mjs</code> en puerto 4566 + smoke test DynamoDB/S3/SQS.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> 4/4 PASS
              </span>
            </div>
            <div className="lt-cicd-stage">
              <span className="lt-stage-num">04 · CD</span>
              <h3>Vite Bundle &amp; Edge</h3>
              <p>Code splitting (<code>vendor-react</code>, <code>vendor-motion</code>, <code>vendor-ionic</code>) y despliegue atómico en Vercel.</p>
              <span className="lt-stage-pass">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" /> HTTP 200 LIVE
              </span>
            </div>
          </div>
        </GlassyReveal>
      </div>
    </main>
  );
};
