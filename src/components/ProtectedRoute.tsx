import React from 'react';
import { Navigate } from 'react-router-dom';
import { WarehouseOperator } from '../models/operator.model';

export interface ProtectedRouteProps {
  readonly operator: WarehouseOperator | null;
  readonly children: React.ReactElement;
}

/**
 * Guardián de Enrutamiento Reactivo (RA 1 y RA 2)
 * - Impide el montaje en el DOM de cualquier vista protegida cuando el terminal está bloqueado.
 * - Homólogo funcional en React Router del guardián `canMatch` de Angular Standalone.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ operator, children }) => {
  if (!operator) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
