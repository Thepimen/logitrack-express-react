import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IonHeader, IonIcon, IonToolbar } from '@ionic/react';
import {
  analyticsOutline,
  cloudDoneOutline,
  cubeOutline,
  homeOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  terminalOutline
} from 'ionicons/icons';
import { WarehouseOperator } from '../models/operator.model';

export interface IndustrialNavbarProps {
  readonly operator: WarehouseOperator | null;
  readonly onLogout: () => void;
}

/**
 * Barra de Navegación Glassmorphism Zafiro (RA 1, RA 2, RA 4)
 * - Utiliza IonHeader e IonToolbar de Ionic Framework v8 con superficie translúcida glassy.
 * - Desmonta completamente del DOM los controles privados cuando no hay sesión activa.
 */
export const IndustrialNavbar: React.FC<IndustrialNavbarProps> = ({ operator, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = (): void => {
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <IonHeader className="lt-ion-header">
      <IonToolbar className="lt-main-toolbar">
        <div className="lt-navbar-inner">
          <Link to="/" className="lt-brand-cluster lt-brand-link" aria-label="Volver a la Landing Page de LogiTrack Express">
            <div className="lt-brand-emblem" aria-hidden="true">
              <IonIcon icon={cubeOutline} />
            </div>
            <div>
              <div className="lt-brand-title-row">
                <span className="lt-brand-name">LOGITRACK EXPRESS</span>
                <span className="lt-brand-version">v3.0 · SAPPHIRE GLASS</span>
              </div>
              <p className="lt-brand-subtitle">
                React 19 · Ionic v8 · Supabase PostgreSQL · AWS Emulator (LocalStack)
              </p>
            </div>
          </Link>

          {operator ? (
            <nav className="lt-nav-links" aria-label="Navegación principal del terminal industrial">
              <Link to="/" className="lt-nav-link">
                <IonIcon icon={homeOutline} aria-hidden="true" />
                <span>Landing</span>
              </Link>

              <Link
                to="/terminal"
                className={`lt-nav-link ${location.pathname === '/terminal' ? 'active' : ''}`}
                aria-current={location.pathname === '/terminal' ? 'page' : undefined}
              >
                <IonIcon icon={terminalOutline} aria-hidden="true" />
                <span>Cinta (Tareas 1-3)</span>
              </Link>

              <Link
                to="/telemetry"
                className={`lt-nav-link ${location.pathname === '/telemetry' ? 'active' : ''}`}
                aria-current={location.pathname === '/telemetry' ? 'page' : undefined}
              >
                <IonIcon icon={analyticsOutline} aria-hidden="true" />
                <span>3D &amp; UUID</span>
              </Link>

              <Link
                to="/cloud-infra"
                className={`lt-nav-link ${location.pathname === '/cloud-infra' ? 'active' : ''}`}
                aria-current={location.pathname === '/cloud-infra' ? 'page' : undefined}
              >
                <IonIcon icon={cloudDoneOutline} aria-hidden="true" />
                <span>BD &amp; AWS Emulator</span>
              </Link>

              <Link
                to="/audit-wcag"
                className={`lt-nav-link ${location.pathname === '/audit-wcag' ? 'active' : ''}`}
                aria-current={location.pathname === '/audit-wcag' ? 'page' : undefined}
              >
                <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                <span>WCAG &amp; IA (T4-T5)</span>
              </Link>
            </nav>
          ) : null}

          {operator ? (
            <div className="lt-operator-status" role="status" aria-label="Operario en turno activo">
              <div className="lt-operator-meta">
                <span className="lt-operator-badge">{operator.badgeId}</span>
                <strong className="lt-operator-name">{operator.fullName}</strong>
                <span className="lt-operator-hub">{operator.assignedHub}</span>
              </div>
              <button
                type="button"
                className="lt-logout-btn"
                onClick={handleLogoutClick}
                title={`Cerrar turno de ${operator.fullName}`}
              >
                <IonIcon icon={logOutOutline} aria-hidden="true" />
                <span>FIN TURNO</span>
              </button>
            </div>
          ) : (
            <div className="lt-unauth-pill" role="status">
              <span className="lt-status-indicator" aria-hidden="true" />
              <span>TERMINAL BLOQUEADO · REQUIERE PLACA RFID</span>
            </div>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};
