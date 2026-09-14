import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth/auth.store';

export const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};
