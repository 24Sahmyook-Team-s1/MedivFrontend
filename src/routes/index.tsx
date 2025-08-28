import { Navigate, Route, Routes } from "react-router-dom";
import Article from "../components/Layout/Article";
import RouteList, { type RouteItem } from "./RouteList";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

const Router: React.FC = () => {
  const protectedRoutes = RouteList.filter((r) => r.guard === "protected");
  const publicOnlyRoutes = RouteList.filter((r) => r.guard === "publicOnly");
  // const neutralRoutes = RouteList.filter((r) => !r.guard || r.guard === "none");

  return (
    <Article>
      <Routes>

        {/* 로그인 라우트 */}
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
            {/* 비로그인 라우트 */}
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


        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/Studies" replace />} />
      </Routes>
    </Article>
  );
};

export default Router;
