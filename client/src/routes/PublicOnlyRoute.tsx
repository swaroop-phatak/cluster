import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/clusters" replace />;
  }

  return <Outlet />;
}