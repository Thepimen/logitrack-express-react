import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { WarehouseOperator } from './models/operator.model';
import { authService } from './services/auth.service';
import { useWarehousePackages } from './hooks/useWarehousePackages';
import { IndustrialNavbar } from './components/IndustrialNavbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { Telemetry3DPage } from './pages/Telemetry3DPage';
import { WcagAndAiAuditPage } from './pages/WcagAndAiAuditPage';

setupIonicReact({
  mode: 'md',
  animated: true
});

export const App: React.FC = () => {
  const [operator, setOperator] = useState<WarehouseOperator | null>(() =>
    authService.getCurrentOperator()
  );
  const warehouseState = useWarehousePackages();

  const handleLoginSuccess = (authenticatedOperator: WarehouseOperator): void => {
    setOperator(authenticatedOperator);
  };

  const handleLogout = (): void => {
    authService.logout();
    setOperator(null);
  };

  return (
    <IonApp className="lt-app-shell">
      <BrowserRouter>
        <div className="lt-layout-root">
          <IndustrialNavbar operator={operator} onLogout={handleLogout} />

          <div className="lt-view-viewport">
            <Routes>
              <Route
                path="/login"
                element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
              />

              <Route
                path="/terminal"
                element={
                  <ProtectedRoute operator={operator}>
                    <HomePage warehouseState={warehouseState} />
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
                path="/audit-wcag"
                element={
                  <ProtectedRoute operator={operator}>
                    <WcagAndAiAuditPage warehouseState={warehouseState} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  operator ? (
                    <Navigate to="/terminal" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </IonApp>
  );
};

export default App;
