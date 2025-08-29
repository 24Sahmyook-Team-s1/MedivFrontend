// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuth";

// ✅ 한 파일 내부에 상수로 정리 (roleAccess.ts 불필요)
const ADMIN_HOME = "/adcon";    // RouteList/Router와 동일하게!
const STAFF_HOME = "/Studies";

const ADMIN_ALLOW = [ADMIN_HOME]; // admin은 다 허용
const STAFF_ALLOW = [STAFF_HOME.toLowerCase(), "/viewer"]; // staff는 studies, viewer만

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const { pathname } = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = String(user?.role ?? "").toLowerCase();
  const path = pathname.toLowerCase();

  // ✅ 허용 경로가 아니면 각 역할 홈으로만 보냄
  if (role === "admin") {
    const ok = ADMIN_ALLOW.some((base) => path.startsWith(base.toLowerCase()));
    if (!ok) return <Navigate to={ADMIN_HOME} replace />;
  } else if (role === "staff") {
    const ok = STAFF_ALLOW.some((base) => path.startsWith(base.toLowerCase()));
    if (!ok) return <Navigate to={STAFF_HOME} replace />;
  }

  return <Outlet />;
}
