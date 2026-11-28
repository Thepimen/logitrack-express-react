import { supabase } from '../config/supabase';
import { awsEmulatorService } from './aws-emulator.service';
import {
  CreatePackageInput,
  generateUuidV4,
  isValidTrackingCode,
  isValidUuidV4,
  PackagePriority,
  PackageStatus,
  PriorityFilter,
  StatusFilter,
  WarehousePackage,
  WarehousePackageRow
} from '../models/package.model';

/**
 * Estado inicial inmutable de referencia (Tarea 1.3 — Array Inmutable ReadonlyArray<WarehousePackage>)
 * Sincronizado con la semilla oficial de PostgreSQL en Supabase (`public.warehouse_packages`).
 */
export const INITIAL_WAREHOUSE_PACKAGES: ReadonlyArray<WarehousePackage> = Object.freeze([
  Object.freeze({
    id: 'a1f4e8c2-7b3d-4e9a-9c1b-2d8f6a4e5b10',
    trackingCode: 'LTK-4821-ES',
    destinationHub: 'MAD-Cargo Terminal T4',
    weightKg: 18.45,
    priority: 'CRITICAL' as PackagePriority,
    status: 'IN_TRANSIT' as PackageStatus,
    timestamp: new Date('2026-11-20T08:15:00.000Z'),
    aisleBay: 'CONVEYOR-C1 · S04',
    inspectorNotes: 'Carga farmacéutica termolábil - Requiere verificación prioritaria de precinto'
  }),
  Object.freeze({
    id: 'b2e7d9a1-5c4f-4a8b-8d2e-3f9a7b5c6d21',
    trackingCode: 'LTK-9034-ES',
    destinationHub: 'BCN-ZAL Prat Logistics',
    weightKg: 6.8,
    priority: 'STANDARD' as PackagePriority,
    status: 'INSPECTED' as PackageStatus,
    timestamp: new Date('2026-11-20T07:45:00.000Z'),
    aisleBay: 'CONVEYOR-A2 · S01',
    inspectorNotes: 'Inspección óptica superada sin anomalías estructurales'
  }),
  Object.freeze({
    id: 'c3d6c0b4-3e5a-4b7c-9e3f-4a0b8c6d7e32',
    trackingCode: 'LTK-1150-ES',
    destinationHub: 'VLC-Puerto Hub Este',
    weightKg: 32.1,
    priority: 'CRITICAL' as PackagePriority,
    status: 'IN_TRANSIT' as PackageStatus,
    timestamp: new Date('2026-11-20T08:40:00.000Z'),
    aisleBay: 'CONVEYOR-C1 · S08',
    inspectorNotes: 'Componentes electrónicos de alta densidad - Revisión de sensor de impacto'
  }),
  Object.freeze({
    id: 'd4c5b1a3-1f6b-4c6d-8f4a-5b1c9d7e8f43',
    trackingCode: 'LTK-7742-ES',
    destinationHub: 'SVQ-Aerópolis Sur',
    weightKg: 11.2,
    priority: 'STANDARD' as PackagePriority,
    status: 'IN_TRANSIT' as PackageStatus,
    timestamp: new Date('2026-11-20T08:05:00.000Z'),
    aisleBay: 'CONVEYOR-B3 · S02',
    inspectorNotes: 'Embalaje estándar paletizado en tránsito por cinta secundaria'
  }),
  Object.freeze({
    id: 'e5b4a2f6-9a7c-4d5e-9a5b-6c2d0e8f9a54',
    trackingCode: 'LTK-3390-ES',
    destinationHub: 'BIO-Abando Industrial',
    weightKg: 24.9,
    priority: 'LOW' as PackagePriority,
    status: 'REJECTED' as PackageStatus,
    timestamp: new Date('2026-11-20T06:50:00.000Z'),
    aisleBay: 'QUARANTINE-Q1 · R02',
    inspectorNotes: 'Etiqueta RFID deteriorada y discrepancia de tara (+2.4 kg)'
  }),
  Object.freeze({
    id: 'f6a3f3e5-7b8d-4e4f-8b6c-7d3e1f9a0b65',
    trackingCode: 'LTK-6208-ES',
    destinationHub: 'ZAZ-Plaza Plataforma',
    weightKg: 4.35,
    priority: 'STANDARD' as PackagePriority,
    status: 'INSPECTED' as PackageStatus,
    timestamp: new Date('2026-11-20T07:20:00.000Z'),
    aisleBay: 'CONVEYOR-A2 · S05',
    inspectorNotes: 'Verificación láser completada y clasificado para salida nacional'
  }),
  Object.freeze({
    id: '0792e4d8-5c9e-4f3a-9c7d-8e4f2a0b1c76',
    trackingCode: 'LTK-8519-ES',
    destinationHub: 'MAD-Coslada Hub Central',
    weightKg: 41.6,
    priority: 'CRITICAL' as PackagePriority,
    status: 'IN_TRANSIT' as PackageStatus,
    timestamp: new Date('2026-11-20T08:51:00.000Z'),
    aisleBay: 'CONVEYOR-C1 · S09',
    inspectorNotes: 'Maquinaria de precisión urgente - Prioridad de embarque inmediato'
  }),
  Object.freeze({
    id: '1881d5c7-3d0f-4a2b-8d8e-9f5a3b1c2d87',
    trackingCode: 'LTK-2047-ES',
    destinationHub: 'AGP-Parque Tecnológico',
    weightKg: 2.75,
    priority: 'LOW' as PackagePriority,
    status: 'IN_TRANSIT' as PackageStatus,
    timestamp: new Date('2026-11-20T05:55:00.000Z'),
    aisleBay: 'CONVEYOR-B3 · S07',
    inspectorNotes: 'Paquetería ligera consolidada pendiente de escaneo final'
  })
]);

/**
 * Transformador puro e inmutable de fila PostgreSQL (snake_case) a entidad de dominio TypeScript (camelCase)
 */
export function mapRowToWarehousePackage(row: WarehousePackageRow): WarehousePackage {
  return Object.freeze({
    id: row.id,
    trackingCode: row.tracking_code,
    destinationHub: row.destination_hub,
    weightKg: typeof row.weight_kg === 'number' ? row.weight_kg : Number.parseFloat(String(row.weight_kg)),
    priority: row.priority,
    status: row.status,
    timestamp: new Date(row.timestamp),
    aisleBay: row.aisle_bay ?? 'CONVEYOR-C1 · S01',
    inspectorNotes: row.inspector_notes ?? ''
  });
}

type PackageListener = (packages: ReadonlyArray<WarehousePackage>) => void;

/**
 * Servicio de Dominio Logístico: PackageService (Tarea 1, Tarea 2, Tarea 3, Tarea 5 y RA 5)
 * Gestiona el estado reactivo mediante snapshots inmutables (ReadonlyArray<WarehousePackage>)
 * sincronizados en tiempo real con PostgreSQL en Supabase (`public.warehouse_packages`).
 * Propaga todos los errores hacia la capa de presentación (sin ocultar fallos).
 */
export class PackageService {
  private packagesSnapshot: ReadonlyArray<WarehousePackage> = INITIAL_WAREHOUSE_PACKAGES;
  private readonly listeners = new Set<PackageListener>();

  /**
   * Devuelve el snapshot inmutable actual en memoria
   */
  public getSnapshot(): ReadonlyArray<WarehousePackage> {
    return this.packagesSnapshot;
  }

  /**
   * Permite suscribirse reactivamente a cambios de estado inmutables.
   * Devuelve función de limpieza (unsubscribe) para evitar fugas de memoria.
   */
  public subscribe(listener: PackageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private commitSnapshot(nextList: ReadonlyArray<WarehousePackage>): ReadonlyArray<WarehousePackage> {
    this.packagesSnapshot = Object.freeze([...nextList]);
    this.listeners.forEach((listener) => listener(this.packagesSnapshot));
    return this.packagesSnapshot;
  }

  /**
   * Operación SELECT real contra Supabase PostgreSQL (`public.warehouse_packages`)
   */
  public async fetchAllPackages(): Promise<ReadonlyArray<WarehousePackage>> {
    const { data, error } = await supabase
      .from('warehouse_packages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[LogiTrack::PackageService] Error en SELECT warehouse_packages:', error.message);
      throw new Error(`Error al consultar paquetes en Supabase PostgreSQL: ${error.message}`);
    }

    const mapped = (data as WarehousePackageRow[]).map(mapRowToWarehousePackage);
    console.log(
      `[LogiTrack::PackageService] SELECT warehouse_packages completado (${mapped.length} paquetes activos en cinta).`
    );
    return this.commitSnapshot(mapped);
  }

  /**
   * Operación UPDATE reactiva e inmutable del estado de inspección (Tarea 3: INSPECTED | REJECTED | IN_TRANSIT)
   */
  public async updatePackageStatus(
    id: string,
    newStatus: PackageStatus,
    inspectorNotes?: string
  ): Promise<WarehousePackage> {
    if (!isValidUuidV4(id)) {
      throw new Error(`El identificador "${id}" no cumple el estándar criptográfico UUID v4.`);
    }

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      timestamp: new Date().toISOString()
    };

    if (typeof inspectorNotes === 'string') {
      updatePayload.inspector_notes = inspectorNotes;
    }

    const { data, error } = await supabase
      .from('warehouse_packages')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      const msg = error?.message ?? 'No se encontró el paquete con el UUID especificado.';
      console.error('[LogiTrack::PackageService] Error en UPDATE warehouse_packages:', msg);
      throw new Error(`No se pudo actualizar el estado del paquete (${id}): ${msg}`);
    }

    const updatedPkg = mapRowToWarehousePackage(data as WarehousePackageRow);
    const nextList = this.packagesSnapshot.map((item) => (item.id === id ? updatedPkg : item));
    this.commitSnapshot(nextList);

    console.log(
      `[LogiTrack::PackageService] UPDATE estado completado -> Paquete ${updatedPkg.trackingCode} (${updatedPkg.id}) marcado como ${updatedPkg.status}`
    );
    void awsEmulatorService.mirrorSinglePackageMutation(
      updatedPkg,
      newStatus === 'REJECTED' ? 'PACKAGE_REJECTED' : 'PACKAGE_INSPECTED'
    );
    return updatedPkg;
  }

  /**
   * Operación INSERT real en Supabase PostgreSQL generando UUID v4 criptográfico en cliente/servidor
   */
  public async createPackage(input: CreatePackageInput): Promise<WarehousePackage> {
    const normalizedTracking = input.trackingCode.trim().toUpperCase();
    if (!isValidTrackingCode(normalizedTracking)) {
      throw new Error(
        `El código de seguimiento "${normalizedTracking}" es inválido. Debe respetar el formato logístico LTK-XXXX-ES (ej. LTK-5912-ES).`
      );
    }

    if (!input.destinationHub || input.destinationHub.trim().length < 3) {
      throw new Error('El hub de destino es obligatorio (mínimo 3 caracteres).');
    }

    if (Number.isNaN(input.weightKg) || input.weightKg <= 0 || input.weightKg > 9999) {
      throw new Error('El peso del paquete debe ser un valor numérico positivo entre 0.01 kg y 9999 kg.');
    }

    const uuid = input.id && isValidUuidV4(input.id) ? input.id : generateUuidV4();

    const insertRow = {
      id: uuid,
      tracking_code: normalizedTracking,
      destination_hub: input.destinationHub.trim(),
      weight_kg: Number(input.weightKg.toFixed(2)),
      priority: input.priority,
      status: input.status ?? ('IN_TRANSIT' as PackageStatus),
      timestamp: new Date().toISOString(),
      aisle_bay: input.aisleBay?.trim() || 'CONVEYOR-C1 · S01',
      inspector_notes:
        input.inspectorNotes?.trim() || 'Recepción registrada en cinta transportadora principal'
    };

    const { data, error } = await supabase
      .from('warehouse_packages')
      .insert(insertRow)
      .select('*')
      .single();

    if (error || !data) {
      const msg = error?.message ?? 'Error desconocido al insertar paquete.';
      console.error('[LogiTrack::PackageService] Error en INSERT warehouse_packages:', msg);
      throw new Error(`Error al dar de alta el paquete ${normalizedTracking}: ${msg}`);
    }

    const createdPkg = mapRowToWarehousePackage(data as WarehousePackageRow);
    this.commitSnapshot([createdPkg, ...this.packagesSnapshot]);

    console.log(
      `[LogiTrack::PackageService] INSERT paquete completado -> ${createdPkg.trackingCode} [UUID v4: ${createdPkg.id}]`
    );
    void awsEmulatorService.mirrorSinglePackageMutation(createdPkg, 'PACKAGE_CREATED');
    return createdPkg;
  }

  /**
   * Operación DELETE real en Supabase PostgreSQL por UUID v4
   */
  public async deletePackage(id: string): Promise<void> {
    if (!isValidUuidV4(id)) {
      throw new Error(`UUID v4 inválido para eliminación: "${id}".`);
    }

    const target = this.packagesSnapshot.find((p) => p.id === id);

    const { error } = await supabase.from('warehouse_packages').delete().eq('id', id);

    if (error) {
      console.error('[LogiTrack::PackageService] Error en DELETE warehouse_packages:', error.message);
      throw new Error(`No se pudo eliminar el paquete ${id}: ${error.message}`);
    }

    const nextList = this.packagesSnapshot.filter((item) => item.id !== id);
    this.commitSnapshot(nextList);

    console.log(
      `[LogiTrack::PackageService] DELETE paquete completado -> ${target?.trackingCode ?? id} eliminado de la cinta.`
    );
    void awsEmulatorService.publishSqsEvent({
      eventType: 'PACKAGE_DELETED',
      trackingCode: target?.trackingCode ?? 'UNKNOWN',
      packageId: id,
      detail: `Envío ${target?.trackingCode ?? id} retirado del registro activo y notificado al historial`
    });
  }

  /**
   * Filtrado declarativo puro e inmutable en memoria (Tarea 2 y Tarea 5)
   */
  public filterPackages(
    source: ReadonlyArray<WarehousePackage>,
    searchQuery: string,
    priorityFilter: PriorityFilter,
    statusFilter: StatusFilter = 'ALL'
  ): ReadonlyArray<WarehousePackage> {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return Object.freeze(
      source.filter((pkg) => {
        const matchesPriority = priorityFilter === 'ALL' || pkg.priority === priorityFilter;
        const matchesStatus = statusFilter === 'ALL' || pkg.status === statusFilter;
        const matchesQuery =
          normalizedQuery.length === 0 ||
          pkg.trackingCode.toLowerCase().includes(normalizedQuery) ||
          pkg.destinationHub.toLowerCase().includes(normalizedQuery) ||
          pkg.id.toLowerCase().includes(normalizedQuery) ||
          pkg.aisleBay.toLowerCase().includes(normalizedQuery);

        return matchesPriority && matchesStatus && matchesQuery;
      })
    );
  }
}

export const packageService = new PackageService();
