import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { IonApp, setupIonicReact } from '@ionic/react';
import { WarehouseOperator } from './models/operator.model';
import { authService } from './services/auth.service';
import { useWarehousePackages } from './hooks/useWarehousePackages';
import { ThemeProvider } from './context/ThemeContext';
import { IndustrialNavbar } from './components/IndustrialNavbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { Telemetry3DPage } from './pages/Telemetry3DPage';
import { CloudInfraPage } from './pages/CloudInfraPage';
import { WcagAndAiAuditPage } from './pages/WcagAndAiAuditPage';

setupIonicReact({
  mode: 'md',
  animated: true
});

interface AppRoutesShellProps {
  readonly operator: WarehouseOperator | null;
  readonly onAuthSuccess: (operator: WarehouseOperator) => void;
  readonly onLogout: () => void;
}

const AppRoutesShell: React.FC<AppRoutesShellProps> = ({
  operator,
  onAuthSuccess,
  onLogout
}) => {
  const location = useLocation();
  const warehouseState = useWarehousePackages();
  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  if (isPublicRoute) {
    return (
      <div className="lt-public-shell">
        <Routes>
          <Route path="/" element={<LandingPage warehouseState={warehouseState} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={onAuthSuccess} />} />
          <Route path="/register" element={<RegisterPage onRegisterSuccess={onAuthSuccess} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="lt-app-dashboard-shell">
      <IndustrialNavbar operator={operator} onLogout={onLogout} />
      <div className="lt-dashboard-stage">
        <Routes>
          <Route
            path="/terminal"
            element={
              <ProtectedRoute operator={operator}>
                <HomePage warehouseState={warehouseState} operator={operator} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/telemetry"
            element={
              <ProtectedRoute operator={operator}>
                <Telemetry3DPage warehouseState={warehouseState} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cloud-infra"
            element={
              <ProtectedRoute operator={operator}>
                <CloudInfraPage
                  warehouseState={warehouseState}
                  operatorBadge={operator?.badgeId ?? 'OP-MAD-0488'}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-wcag"
            element={
              <ProtectedRoute operator={operator}>
                <WcagAndAiAuditPage warehouseState={warehouseState} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [operator, setOperator] = useState<WarehouseOperator | null>(() =>
    authService.getCurrentOperator()
  );

  const handleAuthSuccess = (authenticatedOperator: WarehouseOperator): void => {
    setOperator(authenticatedOperator);
  };

  const handleLogout = (): void => {
    authService.logout();
    setOperator(null);
  };

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <IonApp className="lt-app-shell">
          <BrowserRouter>
            <AppRoutesShell
              operator={operator}
              onAuthSuccess={handleAuthSuccess}
              onLogout={handleLogout}
            />
          </BrowserRouter>
        </IonApp>
      </MotionConfig>
    </ThemeProvider>
  );
};

export default App;
