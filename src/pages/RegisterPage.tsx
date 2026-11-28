import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
  businessOutline,
  idCardOutline,
  keyOutline,
  lockClosedOutline,
  mailOutline,
  personAddOutline,
  personOutline,
  timeOutline
} from 'ionicons/icons';
import { WarehouseOperator } from '../models/operator.model';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';

export interface RegisterPageProps {
  readonly onRegisterSuccess: (operator: WarehouseOperator) => void;
}

function generateSuggestedBadge(): string {
  const num = Math.floor(1000 + Math.random() * 8999);
  return `OP-MAD-${num}`;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [badgeId, setBadgeId] = useState<string>(() => generateSuggestedBadge());
  const [assignedHub, setAssignedHub] = useState<string>('MAD-HUB-01 - Cinta C1');
  const [shift, setShift] = useState<string>('Turno Mañana (06:00 a 14:00)');
  const [accessPin, setAccessPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nameError = fullName.trim().length < 3 ? 'Introduce tu nombre y apellidos.' : null;
  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? 'Introduce un correo corporativo válido.'
    : null;
  const badgeError = !/^[A-Z0-9-]{5,24}$/.test(badgeId.trim().toUpperCase())
    ? 'Usa un formato de placa válido (ej. OP-MAD-4520).'
    : null;
  const pinError = accessPin.trim().length < 6 ? 'La clave debe tener al menos 6 caracteres.' : null;
  const confirmError =
    confirmPin !== accessPin ? 'Las claves de acceso no coinciden.' : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (nameError || emailError || badgeError || pinError || confirmError) {
      return;
    }

    setIsRegistering(true);
    try {
      const operator = await authService.registerOperator({
        fullName,
        email,
        badgeId,
        accessPin,
        role: 'Operador de Inspección',
        assignedHub,
        shift
      });
      onRegisterSuccess(operator);
      navigate('/terminal', { replace: true });
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'No se pudo completar el registro en este momento.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="lt-public-page lt-auth-page-wrap">
      <header className="lt-public-header">
        <div className="lt-public-header-inner">
          <Link to="/" className="lt-public-brand" aria-label="Volver al inicio de LogiTrack Express">
            <BrandMark size={30} />
            <span className="lt-public-logo-text">LogiTrack Express</span>
          </Link>

          <div className="lt-public-auth-actions">
            <ThemeToggleButton />
            <Link to="/" className="lt-public-login-link">
              Inicio
            </Link>
            <Link to="/login" className="lt-public-signup-pill">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="lt-auth-centered-main" aria-labelledby="register-page-heading">
        <div className="lt-geo-field" aria-hidden="true">
          <motion.span
            className="lt-geo-shape lt-geo-square-left"
            animate={{ y: [0, -8, 0], rotate: [14, 19, 14] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="lt-geo-shape lt-geo-circle-right"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="lt-geo-shape lt-geo-square-right"
            animate={{ y: [0, -8, 0], rotate: [-12, -18, -12] }}
            transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="lt-auth-card-shell lt-auth-card-wide"
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lt-auth-card-head">
            <h1 id="register-page-heading" className="lt-auth-page-title">
              Crear cuenta en LogiTrack
            </h1>
            <p className="lt-auth-page-sub">
              Configura tu perfil operativo y tu centro asignado para comenzar a gestionar envíos en línea.
            </p>
          </div>

          {formError && (
            <div className="lt-alert-error" role="alert" aria-live="assertive">
              <IonIcon icon={lockClosedOutline} aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="lt-register-grid">
            <div className="lt-field-group">
              <label htmlFor="reg-fullname">
                <IonIcon icon={personOutline} aria-hidden="true" /> Nombre completo
              </label>
              <input
                id="reg-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="lt-input"
                placeholder="Ej. Carlos Mendoza Ruiz"
                autoComplete="name"
                required
              />
              {submitted && nameError && (
                <span className="lt-field-error" role="alert">{nameError}</span>
              )}
            </div>

            <div className="lt-field-group">
              <label htmlFor="reg-email">
                <IonIcon icon={mailOutline} aria-hidden="true" /> Correo electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lt-input"
                placeholder="carlos.mendoza@logitrack-express.es"
                autoComplete="email"
                required
              />
              {submitted && emailError && (
                <span className="lt-field-error" role="alert">{emailError}</span>
              )}
            </div>

            <div className="lt-field-group">
              <label htmlFor="reg-badge">
                <IonIcon icon={idCardOutline} aria-hidden="true" /> Identificador de placa
              </label>
              <input
                id="reg-badge"
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                className="lt-input lt-mono-input"
                placeholder="OP-MAD-4520"
                required
              />
              {submitted && badgeError && (
                <span className="lt-field-error" role="alert">{badgeError}</span>
              )}
            </div>

            <div className="lt-field-group">
              <label htmlFor="reg-hub">
                <IonIcon icon={businessOutline} aria-hidden="true" /> Centro logístico asignado
              </label>
              <select
                id="reg-hub"
                value={assignedHub}
                onChange={(e) => setAssignedHub(e.target.value)}
                className="lt-select"
              >
                <option value="MAD-HUB-01 - Cinta C1">Madrid Coslada (Cinta C1)</option>
                <option value="BCN-ZAL - Sector A2">Barcelona ZAL (Sector A2)</option>
                <option value="VLC-Puerto - Hub Este">Valencia Puerto (Hub Este)</option>
                <option value="SVQ-Aerópolis - Sur">Sevilla Aerópolis (Sur)</option>
              </select>
            </div>

            <div className="lt-field-group lt-col-span-2">
              <label htmlFor="reg-shift">
                <IonIcon icon={timeOutline} aria-hidden="true" /> Turno habitual
              </label>
              <select
                id="reg-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="lt-select"
              >
                <option value="Turno Mañana (06:00 a 14:00)">Turno Mañana (06:00 a 14:00)</option>
                <option value="Turno Tarde (14:00 a 22:00)">Turno Tarde (14:00 a 22:00)</option>
                <option value="Turno Noche (22:00 a 06:00)">Turno Noche (22:00 a 06:00)</option>
              </select>
            </div>

            <div className="lt-field-group">
              <label htmlFor="reg-pin">
                <IonIcon icon={keyOutline} aria-hidden="true" /> Clave de acceso
              </label>
              <input
                id="reg-pin"
                type="password"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                className="lt-input"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
              {submitted && pinError && (
                <span className="lt-field-error" role="alert">{pinError}</span>
              )}
            </div>

            <div className="lt-field-group">
              <label htmlFor="reg-pin-confirm">
                <IonIcon icon={keyOutline} aria-hidden="true" /> Confirmar clave
              </label>
              <input
                id="reg-pin-confirm"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="lt-input"
                placeholder="Repite tu clave"
                autoComplete="new-password"
                required
              />
              {submitted && confirmError && (
                <span className="lt-field-error" role="alert">{confirmError}</span>
              )}
            </div>

            <div className="lt-col-span-2">
              {isRegistering && (
                <div className="lt-inline-progress-track" aria-hidden="true" style={{ marginBottom: 10 }}>
                  <motion.div
                    className="lt-inline-progress-fill"
                    initial={{ width: '12%' }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                  />
                </div>
              )}
              <button
                type="submit"
                className="lt-btn-primary-solid lt-btn-full"
                disabled={isRegistering}
                data-testid="btn-register-submit"
              >
                <IonIcon icon={personAddOutline} aria-hidden="true" />
                <span>{isRegistering ? 'Creando cuenta...' : 'Crear cuenta y acceder al panel'}</span>
              </button>
            </div>
          </form>

          <div className="lt-auth-switch-footer">
            <span>¿Ya dispones de cuenta?</span>{' '}
            <Link to="/login" className="lt-auth-switch-link">
              Inicia sesión aquí
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
