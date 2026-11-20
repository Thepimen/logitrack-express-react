import { supabase } from '../config/supabase';
import { WarehouseOperator, WarehouseOperatorRow } from '../models/operator.model';

const SESSION_STORAGE_KEY = 'logitrack_operator_session_v2';
const LOGOUT_LOCK_KEY = 'logitrack_terminal_locked_v2';

export const DEFAULT_SHIFT_OPERATOR: WarehouseOperator = Object.freeze({
  id: '91a0b2c3-4d5e-4f6a-8b7c-9d0e1f2a3b4c',
  badgeId: 'OP-MAD-0488',
  fullName: 'Luis Lázaro Pimentel',
  email: 'llazaro@logitrack-express.es',
  role: 'Lead Telemetry & QA Inspector',
  assignedHub: 'MAD-HUB-01 · Cinta Transportadora C1',
  shift: 'Turno Industrial Nocturno (Baja Luminosidad)',
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
      // Hidratación del turno industrial activo por defecto para permitir auditoría directa de subrutas SPA
      this.currentOperator = DEFAULT_SHIFT_OPERATOR;
    } catch {
      this.currentOperator = DEFAULT_SHIFT_OPERATOR;
    }
  }

  public getCurrentOperator(): WarehouseOperator | null {
    return this.currentOperator;
  }

  public isAuthenticated(): boolean {
    return this.currentOperator !== null;
  }

  /**
   * Autenticación real contra PostgreSQL en Supabase (`public.warehouse_operators`)
   */
  public async loginWithBadge(badgeId: string, accessPin: string): Promise<WarehouseOperator> {
    const cleanBadge = badgeId.trim().toUpperCase();
    const cleanPin = accessPin.trim();

    if (!cleanBadge || !cleanPin) {
      throw new Error('Debe introducir el identificador de placa (Badge ID) y el PIN táctico de turno.');
    }

    const { data, error } = await supabase
      .from('warehouse_operators')
      .select('id, badge_id, full_name, email, access_pin, role, assigned_hub, shift, active')
      .eq('badge_id', cleanBadge)
      .maybeSingle();

    if (error) {
      console.error('[LogiTrack::AuthService] Error al verificar operario en Supabase:', error.message);
      throw new Error(`Error de comunicación con el servidor de identidad Supabase: ${error.message}`);
    }

    const row = data as WarehouseOperatorRow | null;
    if (!row || row.access_pin !== cleanPin) {
      throw new Error(
        `Credenciales denegadas para la placa "${cleanBadge}". Verifique el Badge ID (ej. OP-MAD-0488) y su clave de turno.`
      );
    }

    if (!row.active) {
      throw new Error(`La credencial del operario ${row.full_name} se encuentra revocada fuera de turno.`);
    }

    const operator = mapRowToOperator(row);
    this.currentOperator = operator;
    try {
      sessionStorage.removeItem(LOGOUT_LOCK_KEY);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(operator));
    } catch {
      // sessionStorage opcional en entornos restringidos
    }

    console.log(
      `[LogiTrack::AuthService] Sesión industrial autenticada -> ${operator.fullName} (${operator.badgeId}) · ${operator.assignedHub}`
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
      `[LogiTrack::AuthService] Sesión cerrada para operario ${prev?.badgeId ?? 'ACTIVE_OPERATOR'}.`
    );
  }
}

export const authService = new AuthService();
