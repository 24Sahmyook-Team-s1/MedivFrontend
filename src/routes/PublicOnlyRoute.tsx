import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuth'

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/viewer" replace /> : <Outlet />
}
