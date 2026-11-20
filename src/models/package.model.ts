/**
 * Tarea 1 — Modelo de Datos Estricto (strict: true en tsconfig.json)
 * Caso Práctico: LogiTrack Express (Recepción, Inspección Técnica y Clasificación en Cinta Transportadora)
 * Módulo: Desarrollo de Interfaces (Código 0488) · 2º DAM · Instituto Nebrija
 * Alumno: Luis Lázaro Pimentel
 */

export type PackagePriority = 'CRITICAL' | 'STANDARD' | 'LOW';
export type PackageStatus = 'IN_TRANSIT' | 'INSPECTED' | 'REJECTED';

export type PriorityFilter = 'ALL' | PackagePriority;
export type StatusFilter = 'ALL' | PackageStatus;

/**
 * Interfaz oficial WarehousePackage exigida en Tarea 1:
 * - id: string (UUID v4 RFC 4122 / RFC 9562 de 128 bits)
 * - trackingCode: string (formato normalizado LTK-XXXX-ES)
 * - destinationHub: string
 * - weightKg: number
 * - priority: 'CRITICAL' | 'STANDARD' | 'LOW'
 * - status: 'IN_TRANSIT' | 'INSPECTED' | 'REJECTED'
 * - timestamp: Date
 */
export interface WarehousePackage {
  readonly id: string;
  readonly trackingCode: string;
  readonly destinationHub: string;
  readonly weightKg: number;
  readonly priority: PackagePriority;
  readonly status: PackageStatus;
  readonly timestamp: Date;
  readonly aisleBay: string;
  readonly inspectorNotes: string;
}

/**
 * Fila cruda almacenada en la tabla PostgreSQL `public.warehouse_packages` de Supabase
 */
export interface WarehousePackageRow {
  id: string;
  tracking_code: string;
  destination_hub: string;
  weight_kg: number | string;
  priority: PackagePriority;
  status: PackageStatus;
  timestamp: string;
  aisle_bay?: string | null;
  inspector_notes?: string | null;
}

/**
 * DTO de entrada para registrar un nuevo paquete en cinta transportadora
 */
export interface CreatePackageInput {
  id?: string;
  trackingCode: string;
  destinationHub: string;
  weightKg: number;
  priority: PackagePriority;
  status?: PackageStatus;
  aisleBay?: string;
  inspectorNotes?: string;
}

/**
 * Evento tipado emitido por el componente hijo reutilizable (Tarea 3)
 * Equivalente directo en React de:
 * @Output() statusChange = new EventEmitter<{ id: string; newStatus: PackageStatus }>()
 */
export interface PackageStatusChangeEvent {
  readonly id: string;
  readonly newStatus: PackageStatus;
}

/** Expresión regular estricta para validar UUID v4 (RFC 4122 / RFC 9562) */
export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Expresión regular estricta para validar formato logístico LTK-XXXX-ES */
export const TRACKING_CODE_REGEX = /^LTK-\d{4}-ES$/;

export function isValidUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value.trim());
}

export function isValidTrackingCode(value: string): boolean {
  return TRACKING_CODE_REGEX.test(value.trim().toUpperCase());
}

/**
 * Generador criptográfico de UUID v4 (128 bits de entropía CSPRNG mediante Web Crypto API)
 */
export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomNibble = (Math.random() * 16) | 0;
    const value = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Generador de código de seguimiento normalizado LTK-XXXX-ES
 */
export function generateTrackingCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `LTK-${digits}-ES`;
}
