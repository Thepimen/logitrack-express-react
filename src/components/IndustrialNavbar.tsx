import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  cloudDoneOutline,
  gridOutline,
  homeOutline,
  layersOutline,
  logOutOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { WarehouseOperator } from '../models/operator.model';
import { BrandMark } from './BrandMark';

export interface IndustrialNavbarProps {
  readonly operator: WarehouseOperator | null;
  readonly onLogout: () => void;
}

export const IndustrialNavbar: React.FC<IndustrialNavbarProps> = ({ operator, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = (): void => {
    onLogout();
    navigate('/login', { replace: true });
  };

  const navItems: ReadonlyArray<{
    readonly to: string;
    readonly label: string;
    readonly icon: string;
  }> = [
    { to: '/terminal', label: 'Panel', icon: gridOutline },
    { to: '/telemetry', label: 'Cinta 3D', icon: layersOutline },
    { to: '/cloud-infra', label: 'Respaldo', icon: cloudDoneOutline },
    { to: '/audit-wcag', label: 'Calidad', icon: shieldCheckmarkOutline },
    { to: '/', label: 'Inicio', icon: homeOutline }
  ];

  return (
    <aside className="lt-sidebar-rail" aria-label="Navegación principal de LogiTrack">
      <Link to="/" className="lt-sidebar-brand" aria-label="LogiTrack Express Inicio" title="LogiTrack Express">
        <span className="lt-sidebar-logo-icon" aria-hidden="true">
          <BrandMark size={38} />
        </span>
        <span className="lt-sidebar-logo-short">
          <span>Logi</span>
          <span>Track</span>
        </span>
      </Link>

      {operator ? (
        <nav className="lt-sidebar-nav" aria-label="Páginas de la plataforma">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`lt-sidebar-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <IonIcon icon={item.icon} aria-hidden="true" />
                <span className="lt-sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}

      <div className="lt-sidebar-bottom">
        {operator && (
          <button
            type="button"
            className="lt-sidebar-logout"
            onClick={handleLogoutClick}
            aria-label="Cerrar sesión"
            title={`Cerrar turno de ${operator.fullName}`}
          >
            <IonIcon icon={logOutOutline} aria-hidden="true" />
            <span className="lt-sidebar-label">Salir</span>
          </button>
        )}
      </div>
    </aside>
  );
};
