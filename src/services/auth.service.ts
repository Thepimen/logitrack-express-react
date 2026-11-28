import { supabase } from '../config/supabase';
import { WarehouseOperator, WarehouseOperatorRow } from '../models/operator.model';
import { generateUuidV4 } from '../models/package.model';

const SESSION_STORAGE_KEY = 'logitrack_operator_session_v4';
const LOGOUT_LOCK_KEY = 'logitrack_terminal_locked_v4';

export interface RegisterOperatorInput {
  readonly fullName: string;
  readonly email: string;
  readonly badgeId: string;
  readonly accessPin: string;
  readonly role: string;
  readonly assignedHub: string;
  readonly shift: string;
}

export const DEFAULT_SHIFT_OPERATOR: WarehouseOperator = Object.freeze({
  id: '91a0b2c3-4d5e-4f6a-8b7c-9d0e1f2a3b4c',
  badgeId: 'OP-MAD-0488',
  fullName: 'Luis Lázaro Pimentel',
  email: 'llazaro@logitrack-express.es',
  role: 'Inspector Jefe de Operaciones',
  assignedHub: 'MAD-HUB-01 · Cinta C1',
  shift: 'Turno Continuo · Centro Madrid',
  active: true
});

function mapRowToOperator(row: WarehouseOperatorRow): WarehouseOperator {
  return Object.freeze({
    id: row.id,
    badgeId: row.badge_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    assignedHub: row.assigned_hub,
    shift: row.shift,
    active: row.active
  });
}

export class AuthService {
  private currentOperator: WarehouseOperator | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const isLocked = sessionStorage.getItem(LOGOUT_LOCK_KEY) === 'true';
      if (isLocked) {
        this.currentOperator = null;
        return;
      }
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WarehouseOperator;
        if (parsed && parsed.id && parsed.badgeId) {
          this.currentOperator = Object.freeze(parsed);
          return;
        }
      }
      this.currentOperator = DEFAULT_SHIFT_OPERATOR;
    } catch {
      this.currentOperator = DEFAULT_SHIFT_OPERATOR;
    }
  }

  private persistOperatorSession(operator: WarehouseOperator): void {
    this.currentOperator = operator;
    try {
      sessionStorage.removeItem(LOGOUT_LOCK_KEY);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(operator));
    } catch {
      // sessionStorage opcional
    }
  }

  public getCurrentOperator(): WarehouseOperator | null {
    return this.currentOperator;
  }

  public isAuthenticated(): boolean {
    return this.currentOperator !== null;
  }

  /**
   * Inicio de sesión por identificador de placa (OP-XXX-XXXX) o correo corporativo
   */
  public async loginWithBadge(identifier: string, accessPin: string): Promise<WarehouseOperator> {
    const cleanInput = identifier.trim();
    const cleanPin = accessPin.trim();

    if (!cleanInput || !cleanPin) {
      throw new Error('Introduce tu identificador de placa o correo y tu clave de acceso.');
    }

    const isEmail = cleanInput.includes('@');
    const query = supabase
      .from('warehouse_operators')
      .select('id, badge_id, full_name, email, access_pin, role, assigned_hub, shift, active');

    const { data, error } = isEmail
      ? await query.eq('email', cleanInput.toLowerCase()).maybeSingle()
      : await query.eq('badge_id', cleanInput.toUpperCase()).maybeSingle();

    if (error) {
      console.error('[LogiTrack::AuthService] Error al verificar credencial:', error.message);
      throw new Error('No se pudo conectar con el servicio de autenticación. Inténtalo de nuevo.');
    }

    const row = data as WarehouseOperatorRow | null;
    if (!row || row.access_pin !== cleanPin) {
      throw new Error(
        `Credenciales no válidas para "${cleanInput}". Revisa tu identificador y clave de turno.`
      );
    }

    if (!row.active) {
      throw new Error(`La cuenta de ${row.full_name} se encuentra desactivada actualmente.`);
    }

    const operator = mapRowToOperator(row);
    this.persistOperatorSession(operator);
    console.log(
      `[LogiTrack::AuthService] Sesión autenticada -> ${operator.fullName} (${operator.badgeId})`
    );
    return operator;
  }

  /**
   * Registro real de nuevo operario en base de datos con clave primaria UUID v4
   */
  public async registerOperator(input: RegisterOperatorInput): Promise<WarehouseOperator> {
    const cleanName = input.fullName.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanBadge = input.badgeId.trim().toUpperCase();
    const cleanPin = input.accessPin.trim();

    if (cleanName.length < 3) {
      throw new Error('Indica tu nombre completo (mínimo 3 caracteres).');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Introduce una dirección de correo electrónico válida.');
    }
    if (!/^[A-Z0-9-]{5,24}$/.test(cleanBadge)) {
      throw new Error('La placa de operario debe tener formato alfanumérico (ej. OP-MAD-0512).');
    }
    if (cleanPin.length < 6) {
      throw new Error('La clave de acceso debe tener al menos 6 caracteres.');
    }

    const newRow = {
      id: generateUuidV4(),
      badge_id: cleanBadge,
      full_name: cleanName,
      email: cleanEmail,
      access_pin: cleanPin,
      role: input.role.trim() || 'Operador de Clasificación',
      assigned_hub: input.assignedHub.trim() || 'MAD-HUB-01 · Cinta C1',
      shift: input.shift.trim() || 'Turno Mañana',
      active: true
    };

    const { data, error } = await supabase
      .from('warehouse_operators')
      .insert(newRow)
      .select('id, badge_id, full_name, email, access_pin, role, assigned_hub, shift, active')
      .single();

    if (error || !data) {
      const msg = error?.message ?? '';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        throw new Error(
          'Ya existe una cuenta registrada con ese correo o número de placa. Prueba a iniciar sesión.'
        );
      }
      console.error('[LogiTrack::AuthService] Error en registro:', msg);
      throw new Error('No se pudo completar el registro en este momento. Inténtalo de nuevo.');
    }

    const operator = mapRowToOperator(data as WarehouseOperatorRow);
    this.persistOperatorSession(operator);
    console.log(
      `[LogiTrack::AuthService] Nuevo operario registrado -> ${operator.fullName} (${operator.badgeId})`
    );
    return operator;
  }

  public logout(): void {
    const prev = this.currentOperator;
    this.currentOperator = null;
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.setItem(LOGOUT_LOCK_KEY, 'true');
    } catch {
      // Ignorar si sessionStorage está bloqueado
    }
    console.log(
      `[LogiTrack::AuthService] Sesión cerrada para ${prev?.badgeId ?? 'ACTIVE_OPERATOR'}.`
    );
  }
}

export const authService = new AuthService();
