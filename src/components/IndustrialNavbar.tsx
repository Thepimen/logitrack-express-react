import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IonHeader, IonIcon, IonToolbar } from '@ionic/react';
import {
  analyticsOutline,
  cubeOutline,
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
 * Barra de Navegación Industrial Superior (RA 1, RA 2, RA 4)
 * - Utiliza IonHeader e IonToolbar de Ionic Framework v8.
 * - Desmonta completamente del DOM los controles privados cuando no hay sesión activa
 *   (prohibido ocultar con display: none).
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
          <div className="lt-brand-cluster">
            <div className="lt-brand-emblem" aria-hidden="true">
              <IonIcon icon={cubeOutline} />
            </div>
            <div>
              <div className="lt-brand-title-row">
                <span className="lt-brand-name">LOGITRACK EXPRESS</span>
                <span className="lt-brand-version">v2.4 · IONIC v8 + REACT 19</span>
              </div>
              <p className="lt-brand-subtitle">
                Terminal de Recepción, Inspección Técnica y Clasificación en Cinta Transportadora
              </p>
            </div>
          </div>

          {operator ? (
            <nav className="lt-nav-links" aria-label="Navegación principal del terminal industrial">
              <Link
                to="/terminal"
                className={`lt-nav-link ${location.pathname === '/terminal' ? 'active' : ''}`}
                aria-current={location.pathname === '/terminal' ? 'page' : undefined}
              >
                <IonIcon icon={terminalOutline} aria-hidden="true" />
                <span>Cinta &amp; Inspección (Tareas 1-3)</span>
              </Link>

              <Link
                to="/telemetry"
                className={`lt-nav-link ${location.pathname === '/telemetry' ? 'active' : ''}`}
                aria-current={location.pathname === '/telemetry' ? 'page' : undefined}
              >
                <IonIcon icon={analyticsOutline} aria-hidden="true" />
                <span>Gemelo Digital 3D</span>
              </Link>

              <Link
                to="/audit-wcag"
                className={`lt-nav-link ${location.pathname === '/audit-wcag' ? 'active' : ''}`}
                aria-current={location.pathname === '/audit-wcag' ? 'page' : undefined}
              >
                <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                <span>WCAG 2.1 &amp; Auditoría IA (Tareas 4-5)</span>
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
              <span>TERMINAL BLOQUEADO · REQUIERE PLACA DE OPERARIO</span>
            </div>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};
