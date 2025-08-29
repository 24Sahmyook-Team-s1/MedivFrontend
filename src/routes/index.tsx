// src/routes/Router.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import Article from "../components/Layout/Article";
import RouteList, { type RouteItem } from "./RouteList";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { useAuthStore } from "../stores/useAuth";

const Router: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const protectedRoutes = RouteList.filter((r) => r.guard === "protected");
  const publicOnlyRoutes = RouteList.filter((r) => r.guard === "publicOnly");

  const role = String(user?.role ?? "").toLowerCase();

  // 역할별 기본 홈
  const home = role === "admin" ? "/adcon" : "/Studies";

  return (
    <Article>
      <Routes>
        {/* 보호 라우트 */}
        {protectedRoutes.length > 0 && (
          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map((route: RouteItem) => (
              <Route
                key={`${route.name}:${route.path}`}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        )}

        {/* 비로그인 전용 라우트(여기에 /login 컴포넌트 포함) */}
        {publicOnlyRoutes.length > 0 && (
          <Route element={<PublicOnlyRoute />}>
            {publicOnlyRoutes.map((route: RouteItem) => (
              <Route
                key={`${route.name}:${route.path}`}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        )}

        {/* 캐치올: 인증이면 역할 홈, 아니면 로그인으로 */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={home} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Article>
  );
};

export default Router;
