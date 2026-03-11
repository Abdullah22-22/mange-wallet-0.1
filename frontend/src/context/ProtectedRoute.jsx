import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";


export default function ProtectedRoute({ redirectTo = "/" }) {
  const { user, loading, booting } = useAuthContext();
  const location = useLocation();

  if (booting || loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}