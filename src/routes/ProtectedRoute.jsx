import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles, loginPath = "/login" }) {
  const { loading, profile, user } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate replace state={{ from: location }} to={loginPath} />;
  }

  const role = profile?.role || "user";

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate replace to={role === "admin" ? "/admin" : "/"} />;
  }

  return <Outlet />;
}
