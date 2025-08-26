import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuth'

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const ok = BYPASS || isAuthenticated
  return ok ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
