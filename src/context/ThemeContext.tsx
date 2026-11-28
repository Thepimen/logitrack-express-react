import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

export type AppThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  readonly theme: AppThemeMode;
  readonly isDark: boolean;
  readonly setTheme: (mode: AppThemeMode) => void;
  readonly toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'logitrack_theme_mode_v4';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): AppThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignorar en entornos sin localStorage
  }
  return 'light';
}

function applyThemeToDocument(mode: AppThemeMode): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  if (mode === 'dark') {
    root.classList.add('ion-palette-dark');
  } else {
    root.classList.remove('ion-palette-dark');
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', mode === 'dark' ? '#081020' : '#F4F7FB');
  }
}

export const ThemeProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppThemeMode>(() => readInitialTheme());

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [theme]);

  const setTheme = useCallback((mode: AppThemeMode): void => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe utilizarse dentro de <ThemeProvider>.');
  }
  return ctx;
}

export interface ThemeToggleButtonProps {
  readonly compact?: boolean;
  readonly className?: string;
}

/**
 * Selector Global Claro / Oscuro persistente en todas las vistas de la aplicación
 * (Landing, Inicio de Sesión, Registro, Panel Principal, Cinta 3D, Respaldo y Calidad).
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  compact = false,
  className = ''
}) => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Modo claro' : 'Modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`lt-theme-toggle-btn ${compact ? 'is-compact' : ''} ${className}`.trim()}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      data-testid="btn-theme-toggle"
    >
      <IonIcon icon={isDark ? sunnyOutline : moonOutline} aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </button>
  );
};
