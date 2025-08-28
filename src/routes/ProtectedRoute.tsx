// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuth';

export default function ProtectedRoute() {
  const location = useLocation();
  const {isAuthenticated} = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
