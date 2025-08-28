// src/routes/PublicOnlyRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuth';

export default function PublicOnlyRoute() {
  const location = useLocation();
  const {isAuthenticated} = useAuthStore();

  if (isAuthenticated) {
    const to = (location.state as any)?.from?.pathname ?? '/Studies';
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
