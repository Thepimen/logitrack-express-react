import { WarehousePackage, generateUuidV4 } from '../models/package.model';

/**
 * ============================================================================
 * LOGITRACK EXPRESS v3.0 — AWS EMULATOR SERVICE (LocalStack v3.8 Bridge)
 * ============================================================================
 * Puente tipado en modo estricto (`strict: true`, cero `any`) hacia el
 * emulador AWS LocalStack (`http://localhost:4566`) para tres servicios cloud:
 *   1. Amazon DynamoDB (`LogiTrackPackages`) — Réplica NoSQL de baja latencia
 *   2. Amazon S3 (`logitrack-manifests-eu-west-3`) — Manifiestos JSON inmutables
 *   3. Amazon SQS (`logitrack-inspection-events`) — Bus de eventos de inspección
 *
 * Arquitectura Dual Resiliente:
 * - Si el emulador LocalStack (`docker compose up` o `npm run aws:emulator`) está
 *   escuchando en `VITE_AWS_EMULATOR_ENDPOINT`, ejecuta peticiones HTTP reales.
 * - En despliegue público (Vercel Edge, sin acceso al localhost del visitante),
 *   conmuta automáticamente al motor de protocolo AWS en sandbox del navegador
 *   (`localStorage`), preservando los sobres exactos de respuesta AWS.
 */

export type AwsEmulatorRuntimeMode = 'LOCALSTACK_LIVE_4566' | 'EDGE_SANDBOX_EMULATOR';

export interface DynamoDbAttributeItem {
  readonly id: { readonly S: string };
  readonly trackingCode: { readonly S: string };
  readonly destinationHub: { readonly S: string };
  readonly weightKg: { readonly N: string };
  readonly priority: { readonly S: string };
  readonly status: { readonly S: string };
  readonly aisleBay: { readonly S: string };
  readonly syncedAt: { readonly S: string };
}

export interface S3ManifestObject {
  readonly key: string;
  readonly bucket: string;
  readonly etag: string;
  readonly sizeBytes: number;
  readonly lastModified: string;
  readonly packageCount: number;
  readonly previewJson: string;
}

export interface SqsInspectionEvent {
  readonly messageId: string;
  readonly receiptHandle: string;
  readonly md5OfBody: string;
  readonly eventType: 'PACKAGE_CREATED' | 'PACKAGE_INSPECTED' | 'PACKAGE_REJECTED' | 'PACKAGE_DELETED' | 'BATCH_SYNC';
  readonly trackingCode: string;
  readonly packageId: string;
  readonly detail: string;
  readonly sentTimestamp: string;
}

export interface AwsEmulatorSnapshot {
  readonly mode: AwsEmulatorRuntimeMode;
  readonly endpoint: string;
  readonly region: string;
  readonly dynamoTable: string;
  readonly s3Bucket: string;
  readonly sqsQueue: string;
  readonly latencyMs: number;
  readonly dynamoItems: ReadonlyArray<DynamoDbAttributeItem>;
  readonly s3Objects: ReadonlyArray<S3ManifestObject>;
  readonly sqsMessages: ReadonlyArray<SqsInspectionEvent>;
}

const SANDBOX_STORAGE_KEY = 'logitrack_aws_emulator_sandbox_v3';

interface SandboxPersistedState {
  dynamoItems: DynamoDbAttributeItem[];
  s3Objects: S3ManifestObject[];
  sqsMessages: SqsInspectionEvent[];
}

function computeSimpleHexHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${partA}${partB}${partA.split('').reverse().join('')}${partB.split('').reverse().join('')}`;
}

export function mapPackageToDynamoItem(pkg: WarehousePackage): DynamoDbAttributeItem {
  return Object.freeze({
    id: { S: pkg.id },
    trackingCode: { S: pkg.trackingCode },
    destinationHub: { S: pkg.destinationHub },
    weightKg: { N: pkg.weightKg.toFixed(2) },
    priority: { S: pkg.priority },
    status: { S: pkg.status },
    aisleBay: { S: pkg.aisleBay },
    syncedAt: { S: new Date().toISOString() }
  });
}

export class AwsEmulatorService {
  public readonly endpoint: string;
  public readonly region: string;
  public readonly dynamoTable: string;
  public readonly s3Bucket: string;
  public readonly sqsQueue: string;

  private mode: AwsEmulatorRuntimeMode = 'EDGE_SANDBOX_EMULATOR';
  private lastLatencyMs = 4;
  private sandbox: SandboxPersistedState;

  constructor() {
    this.endpoint = (import.meta.env.VITE_AWS_EMULATOR_ENDPOINT || 'http://localhost:4566').trim();
    this.region = (import.meta.env.VITE_AWS_REGION || 'eu-west-3').trim();
    this.dynamoTable = (import.meta.env.VITE_AWS_DYNAMODB_TABLE || 'LogiTrackPackages').trim();
    this.s3Bucket = (import.meta.env.VITE_AWS_S3_BUCKET || 'logitrack-manifests-eu-west-3').trim();
    this.sqsQueue = (import.meta.env.VITE_AWS_SQS_QUEUE || 'logitrack-inspection-events').trim();
    this.sandbox = this.loadSandbox();
  }

  private loadSandbox(): SandboxPersistedState {
    try {
      const raw = localStorage.getItem(SANDBOX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SandboxPersistedState>;
        return {
          dynamoItems: Array.isArray(parsed.dynamoItems) ? parsed.dynamoItems : [],
          s3Objects: Array.isArray(parsed.s3Objects) ? parsed.s3Objects : [],
          sqsMessages: Array.isArray(parsed.sqsMessages) ? parsed.sqsMessages : []
        };
      }
    } catch {
      // Continuar con estado en memoria si localStorage no está disponible
    }

    const seedEvent: SqsInspectionEvent = {
      messageId: '4c2a8b10-9f1e-4d7c-8a2b-11e3f5a9c001',
      receiptHandle: 'rh-4c2a8b10-9f1e',
      md5OfBody: computeSimpleHexHash('BOOTSTRAP_LOCALSTACK_READY'),
      eventType: 'BATCH_SYNC',
      trackingCode: 'LTK-4821-ES',
      packageId: 'a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10',
      detail: 'Bus SQS logitrack-inspection-events inicializado · Enlace dual con Supabase PostgreSQL activo',
      sentTimestamp: new Date().toISOString()
    };

    return {
      dynamoItems: [],
      s3Objects: [],
      sqsMessages: [seedEvent]
    };
  }

  private saveSandbox(): void {
    try {
      localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(this.sandbox));
    } catch {
      // Ignorar errores de cuota
    }
  }

  /**
   * Detecta si LocalStack / AWS Emulator está activo en http://localhost:4566.
   * En hosts públicos (HTTPS en Vercel) evita errores de Mixed Content y usa directamente
   * el emulador wire-compatible de navegador, manteniendo 0 errores en consola DevTools.
   */
  public async detectRuntimeMode(): Promise<AwsEmulatorRuntimeMode> {
    const isLocalHostBrowser =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalHostBrowser && this.endpoint.startsWith('http://localhost')) {
      this.mode = 'EDGE_SANDBOX_EMULATOR';
      this.lastLatencyMs = 3;
      return this.mode;
    }

    const start = performance.now();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 900);

    try {
      const res = await fetch(`${this.endpoint}/_localstack/health`, {
        method: 'GET',
        signal: controller.signal
      });
      if (res.ok) {
        this.mode = 'LOCALSTACK_LIVE_4566';
        this.lastLatencyMs = Math.max(1, Math.round(performance.now() - start));
        return this.mode;
      }
    } catch {
      // Si el emulador local no está arrancado, conmuta limpiamente al modo Sandbox
    } finally {
      window.clearTimeout(timer);
    }

    this.mode = 'EDGE_SANDBOX_EMULATOR';
    this.lastLatencyMs = 3;
    return this.mode;
  }

  public getSyncSnapshot(seedPackages?: ReadonlyArray<WarehousePackage>): AwsEmulatorSnapshot {
    if (this.sandbox.dynamoItems.length === 0 && seedPackages && seedPackages.length > 0) {
      this.sandbox.dynamoItems = seedPackages.map(mapPackageToDynamoItem);
      this.saveSandbox();
    }
    return Object.freeze({
      mode: this.mode,
      endpoint: this.endpoint,
      region: this.region,
      dynamoTable: this.dynamoTable,
      s3Bucket: this.s3Bucket,
      sqsQueue: this.sqsQueue,
      latencyMs: this.lastLatencyMs,
      dynamoItems: Object.freeze([...this.sandbox.dynamoItems]),
      s3Objects: Object.freeze([...this.sandbox.s3Objects]),
      sqsMessages: Object.freeze([...this.sandbox.sqsMessages])
    });
  }

  public async getSnapshot(seedPackages?: ReadonlyArray<WarehousePackage>): Promise<AwsEmulatorSnapshot> {
    await this.detectRuntimeMode();

    if (this.mode === 'LOCALSTACK_LIVE_4566') {
      try {
        const [scanRes, s3Res, sqsRes] = await Promise.all([
          fetch(`${this.endpoint}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-amz-json-1.0',
              'X-Amz-Target': 'DynamoDB_20120810.Scan'
            },
            body: JSON.stringify({ TableName: this.dynamoTable })
          }),
          fetch(`${this.endpoint}/${this.s3Bucket}`),
          fetch(`${this.endpoint}/000000000000/${this.sqsQueue}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Action: 'ReceiveMessage' })
          })
        ]);

        const scanData = (await scanRes.json()) as { Items?: DynamoDbAttributeItem[] };
        const s3Data = (await s3Res.json()) as {
          Contents?: Array<{ Key: string; ETag: string; Size: number; LastModified: string }>;
        };
        const sqsData = (await sqsRes.json()) as {
          Messages?: Array<{
            MessageId: string;
            ReceiptHandle: string;
            MD5OfBody: string;
            Body: string;
            SentTimestamp?: string;
          }>;
        };

        const parsedSqs: SqsInspectionEvent[] = (sqsData.Messages ?? []).map((m) => {
          try {
            const inner = JSON.parse(m.Body) as Partial<SqsInspectionEvent>;
            return {
              messageId: m.MessageId,
              receiptHandle: m.ReceiptHandle,
              md5OfBody: m.MD5OfBody,
              eventType: inner.eventType ?? 'BATCH_SYNC',
              trackingCode: inner.trackingCode ?? 'LTK-SYS-ES',
              packageId: inner.packageId ?? m.MessageId,
              detail: inner.detail ?? m.Body,
              sentTimestamp: m.SentTimestamp ?? new Date().toISOString()
            };
          } catch {
            return {
              messageId: m.MessageId,
              receiptHandle: m.ReceiptHandle,
              md5OfBody: m.MD5OfBody,
              eventType: 'BATCH_SYNC',
              trackingCode: 'LTK-SYS-ES',
              packageId: m.MessageId,
              detail: m.Body,
              sentTimestamp: m.SentTimestamp ?? new Date().toISOString()
            };
          }
        });

        const parsedS3: S3ManifestObject[] = (s3Data.Contents ?? []).map((obj) => ({
          key: obj.Key,
          bucket: this.s3Bucket,
          etag: obj.ETag,
          sizeBytes: obj.Size,
          lastModified: obj.LastModified,
          packageCount: scanData.Items?.length ?? 0,
          previewJson: `s3://${this.s3Bucket}/${obj.Key}`
        }));

        return Object.freeze({
          mode: this.mode,
          endpoint: this.endpoint,
          region: this.region,
          dynamoTable: this.dynamoTable,
          s3Bucket: this.s3Bucket,
          sqsQueue: this.sqsQueue,
          latencyMs: this.lastLatencyMs,
          dynamoItems: Object.freeze(scanData.Items ?? []),
          s3Objects: Object.freeze(parsedS3),
          sqsMessages: Object.freeze(parsedSqs)
        });
      } catch {
        this.mode = 'EDGE_SANDBOX_EMULATOR';
      }
    }

    if (this.sandbox.dynamoItems.length === 0 && seedPackages && seedPackages.length > 0) {
      this.sandbox.dynamoItems = seedPackages.map(mapPackageToDynamoItem);
      this.saveSandbox();
    }

    return Object.freeze({
      mode: this.mode,
      endpoint: this.endpoint,
      region: this.region,
      dynamoTable: this.dynamoTable,
      s3Bucket: this.s3Bucket,
      sqsQueue: this.sqsQueue,
      latencyMs: this.lastLatencyMs,
      dynamoItems: Object.freeze([...this.sandbox.dynamoItems]),
      s3Objects: Object.freeze([...this.sandbox.s3Objects]),
      sqsMessages: Object.freeze([...this.sandbox.sqsMessages])
    });
  }

  /**
   * Replica una colección completa de paquetes desde Supabase PostgreSQL hacia DynamoDB (`PutItem`)
   */
  public async syncPackagesToDynamoDb(
    packages: ReadonlyArray<WarehousePackage>
  ): Promise<{ syncedCount: number; mode: AwsEmulatorRuntimeMode }> {
    const mode = await this.detectRuntimeMode();
    const mappedItems = packages.map(mapPackageToDynamoItem);

    if (mode === 'LOCALSTACK_LIVE_4566') {
      await Promise.all(
        mappedItems.map((item) =>
          fetch(`${this.endpoint}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-amz-json-1.0',
              'X-Amz-Target': 'DynamoDB_20120810.PutItem'
            },
            body: JSON.stringify({ TableName: this.dynamoTable, Item: item })
          })
        )
      );
    }

    this.sandbox.dynamoItems = [...mappedItems];
    this.saveSandbox();

    await this.publishSqsEvent({
      eventType: 'BATCH_SYNC',
      trackingCode: packages[0]?.trackingCode ?? 'BATCH-ALL',
      packageId: packages[0]?.id ?? generateUuidV4(),
      detail: `Sincronización completada en copia rápida de respaldo: ${mappedItems.length} envíos actualizados`
    });

    console.log(
      `[LogiTrack::AWS-Emulator] DynamoDB PutItem batch completado (${mappedItems.length} registros · modo=${mode}).`
    );
    return { syncedCount: mappedItems.length, mode };
  }

  /**
   * Archiva un manifiesto JSON auditable de la cinta en Amazon S3 (`PutObject`)
   */
  public async archiveManifestToS3(
    packages: ReadonlyArray<WarehousePackage>,
    operatorBadge: string
  ): Promise<S3ManifestObject> {
    const mode = await this.detectRuntimeMode();
    const isoStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `manifests/belt-c1-${isoStamp}.json`;

    const manifestPayload = {
      schema: 'logitrack.manifest.v3',
      region: this.region,
      operatorBadge,
      generatedAt: new Date().toISOString(),
      summary: {
        totalPackages: packages.length,
        inspected: packages.filter((p) => p.status === 'INSPECTED').length,
        inTransit: packages.filter((p) => p.status === 'IN_TRANSIT').length,
        rejected: packages.filter((p) => p.status === 'REJECTED').length,
        totalWeightKg: Number(packages.reduce((acc, p) => acc + p.weightKg, 0).toFixed(2))
      },
      packages: packages.map((p) => ({
        uuid: p.id,
        trackingCode: p.trackingCode,
        hub: p.destinationHub,
        weightKg: p.weightKg,
        priority: p.priority,
        status: p.status
      }))
    };

    const jsonBody = JSON.stringify(manifestPayload, null, 2);
    let etag = `"${computeSimpleHexHash(jsonBody)}"`;

    if (mode === 'LOCALSTACK_LIVE_4566') {
      const res = await fetch(`${this.endpoint}/${this.s3Bucket}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody
      });
      if (res.ok) {
        const data = (await res.json()) as { ETag?: string };
        if (data.ETag) etag = data.ETag;
      }
    }

    const record: S3ManifestObject = Object.freeze({
      key,
      bucket: this.s3Bucket,
      etag,
      sizeBytes: new TextEncoder().encode(jsonBody).length,
      lastModified: new Date().toISOString(),
      packageCount: packages.length,
      previewJson: jsonBody
    });

    this.sandbox.s3Objects = [record, ...this.sandbox.s3Objects].slice(0, 12);
    this.saveSandbox();

    console.log(
      `[LogiTrack::AWS-Emulator] S3 PutObject completado -> s3://${this.s3Bucket}/${key} (ETag: ${etag}).`
    );
    return record;
  }

  /**
   * Publica un evento de dominio en Amazon SQS (`SendMessage`)
   */
  public async publishSqsEvent(input: {
    readonly eventType: SqsInspectionEvent['eventType'];
    readonly trackingCode: string;
    readonly packageId: string;
    readonly detail: string;
  }): Promise<SqsInspectionEvent> {
    const mode = await this.detectRuntimeMode();
    const messageBody = JSON.stringify(input);
    let messageId = generateUuidV4();
    let md5 = computeSimpleHexHash(messageBody);

    if (mode === 'LOCALSTACK_LIVE_4566') {
      try {
        const res = await fetch(`${this.endpoint}/000000000000/${this.sqsQueue}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Action: 'SendMessage',
            MessageBody: messageBody
          })
        });
        if (res.ok) {
          const data = (await res.json()) as { MessageId?: string; MD5OfMessageBody?: string };
          if (data.MessageId) messageId = data.MessageId;
          if (data.MD5OfMessageBody) md5 = data.MD5OfMessageBody;
        }
      } catch {
        // Fallback silencioso a sandbox
      }
    }

    const eventRecord: SqsInspectionEvent = Object.freeze({
      messageId,
      receiptHandle: `rh-${messageId.slice(0, 12)}`,
      md5OfBody: md5,
      eventType: input.eventType,
      trackingCode: input.trackingCode,
      packageId: input.packageId,
      detail: input.detail,
      sentTimestamp: new Date().toISOString()
    });

    this.sandbox.sqsMessages = [eventRecord, ...this.sandbox.sqsMessages].slice(0, 25);
    this.saveSandbox();

    console.log(
      `[LogiTrack::AWS-Emulator] SQS SendMessage -> ${input.eventType} (${input.trackingCode}) [MessageId: ${messageId.slice(0, 8)}…]`
    );
    return eventRecord;
  }

  /**
   * Espejo individual tras operaciones CRUD en Supabase PostgreSQL
   */
  public async mirrorSinglePackageMutation(
    pkg: WarehousePackage,
    eventType: 'PACKAGE_CREATED' | 'PACKAGE_INSPECTED' | 'PACKAGE_REJECTED'
  ): Promise<void> {
    const item = mapPackageToDynamoItem(pkg);
    const mode = await this.detectRuntimeMode();

    if (mode === 'LOCALSTACK_LIVE_4566') {
      try {
        await fetch(`${this.endpoint}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'DynamoDB_20120810.PutItem'
          },
          body: JSON.stringify({ TableName: this.dynamoTable, Item: item })
        });
      } catch {
        // Continuar con sandbox local
      }
    }

    const existingIdx = this.sandbox.dynamoItems.findIndex((i) => i.id.S === pkg.id);
    if (existingIdx >= 0) {
      this.sandbox.dynamoItems[existingIdx] = item;
    } else {
      this.sandbox.dynamoItems.unshift(item);
    }
    this.saveSandbox();

    await this.publishSqsEvent({
      eventType,
      trackingCode: pkg.trackingCode,
      packageId: pkg.id,
      detail: `Cambio sincronizado en copia de respaldo: ${pkg.trackingCode} en estado ${pkg.status} (${pkg.destinationHub})`
    });
  }
}

export const awsEmulatorService = new AwsEmulatorService();
