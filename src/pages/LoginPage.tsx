import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  keyOutline,
  lockClosedOutline,
  personOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { WarehouseOperator } from '../models/operator.model';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';

export interface LoginPageProps {
  readonly onLoginSuccess: (operator: WarehouseOperator) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState<string>('OP-MAD-0488');
  const [accessPin, setAccessPin] = useState<string>('LT-2026-DAM');
  const [touchedId, setTouchedId] = useState<boolean>(false);
  const [touchedPin, setTouchedPin] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const idValidationError =
    identifier.trim().length < 5
      ? 'Introduce tu placa de operario (ej. OP-MAD-0488) o tu correo corporativo.'
      : null;

  const pinValidationError =
    accessPin.trim().length < 4
      ? 'La clave de acceso debe contener al menos 4 caracteres.'
      : null;

  const handleOperatorSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setTouchedId(true);
    setTouchedPin(true);
    setAuthError(null);

    if (idValidationError || pinValidationError) {
      return;
    }

    setIsAuthenticating(true);
    try {
      const operator = await authService.loginWithBadge(identifier, accessPin);
      onLoginSuccess(operator);
      navigate('/terminal', { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión en este momento. Inténtalo de nuevo.';
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const applyPresetOperator = (presetBadge: string, presetPin: string): void => {
    setIdentifier(presetBadge);
    setAccessPin(presetPin);
    setAuthError(null);
  };

  return (
    <div className="lt-public-page lt-auth-page-wrap">
      <header className="lt-public-header">
        <div className="lt-public-header-inner">
          <Link to="/" className="lt-public-brand" aria-label="Volver al inicio de LogiTrack Express">
            <BrandMark size={34} />
            <span className="lt-public-logo-text">LogiTrack Express</span>
          </Link>

          <div className="lt-public-auth-actions">
            <ThemeToggleButton />
            <Link to="/" className="lt-public-login-link">
              Inicio
            </Link>
            <Link to="/register" className="lt-public-signup-pill">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="lt-auth-centered-main" aria-labelledby="login-page-heading">
        <div className="lt-geo-field" aria-hidden="true">
          <span className="lt-geo-shape lt-geo-square-left" />
          <span className="lt-geo-shape lt-geo-circle-right" />
          <span className="lt-geo-shape lt-geo-arc-left" />
        </div>

        <div className="lt-auth-card-shell">
          <div className="lt-auth-card-head">
            <h1 id="login-page-heading" className="lt-auth-page-title">
              Iniciar sesión en LogiTrack Express
            </h1>
            <p className="lt-auth-page-sub">
              Accede a tu turno activo para consultar envíos, inspeccionar la cinta y gestionar
              incidencias.
            </p>
          </div>

          {authError && (
            <div
              className="lt-alert-error"
              role="alert"
              aria-live="assertive"
              data-testid="login-error-alert"
            >
              <IonIcon icon={lockClosedOutline} aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleOperatorSubmit(e)} noValidate className="lt-auth-form">
            <div className="lt-field-group">
              <label htmlFor="operator-badge-input">
                <IonIcon icon={personOutline} aria-hidden="true" /> Placa de operario o correo
                electrónico
              </label>
              <input
                id="operator-badge-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() => setTouchedId(true)}
                aria-invalid={touchedId && Boolean(idValidationError)}
                aria-describedby={touchedId && idValidationError ? 'badge-error-msg' : undefined}
                className="lt-input"
                placeholder="OP-MAD-0488 o tu@correo.es"
                autoComplete="username"
                required
              />
              {touchedId && idValidationError && (
                <span id="badge-error-msg" className="lt-field-error" role="alert">
                  {idValidationError}
                </span>
              )}
            </div>

            <div className="lt-field-group">
              <label htmlFor="operator-pin-input">
                <IonIcon icon={keyOutline} aria-hidden="true" /> Clave de acceso
              </label>
              <input
                id="operator-pin-input"
                type="password"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                onBlur={() => setTouchedPin(true)}
                aria-invalid={touchedPin && Boolean(pinValidationError)}
                aria-describedby={touchedPin && pinValidationError ? 'pin-error-msg' : undefined}
                className="lt-input"
                placeholder="Introduce tu clave de turno"
                autoComplete="current-password"
                required
              />
              {touchedPin && pinValidationError && (
                <span id="pin-error-msg" className="lt-field-error" role="alert">
                  {pinValidationError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="lt-btn-primary-solid lt-btn-full"
              disabled={isAuthenticating}
              data-testid="btn-login-submit"
            >
              <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
              <span>{isAuthenticating ? 'Verificando acceso...' : 'Entrar al panel operativo'}</span>
            </button>
          </form>

          <div className="lt-preset-operators" aria-label="Perfiles de acceso rápido disponibles">
            <span className="lt-preset-label">Perfiles de acceso rápido de demostración:</span>
            <div className="lt-preset-grid">
              <button
                type="button"
                className={`lt-preset-btn ${identifier.toUpperCase() === 'OP-MAD-0488' ? 'active' : ''}`}
                onClick={() => applyPresetOperator('OP-MAD-0488', 'LT-2026-DAM')}
              >
                <strong>OP-MAD-0488 - Luis Lázaro Pimentel</strong>
                <span>Inspector jefe en Centro Madrid (MAD-HUB-01)</span>
              </button>

              <button
                type="button"
                className={`lt-preset-btn ${identifier.toUpperCase() === 'OP-BCN-0219' ? 'active' : ''}`}
                onClick={() => applyPresetOperator('OP-BCN-0219', 'LT-2026-BCN')}
              >
                <strong>OP-BCN-0219 - Elena Vance</strong>
                <span>Operadora sénior en Centro Barcelona (BCN-ZAL)</span>
              </button>
            </div>
          </div>

          <div className="lt-auth-switch-footer">
            <span>¿Todavía no tienes cuenta de operario?</span>{' '}
            <Link to="/register" className="lt-auth-switch-link">
              Crear una cuenta nueva
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
