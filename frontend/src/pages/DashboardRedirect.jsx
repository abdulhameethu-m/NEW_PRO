import { Navigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (user.role === "vendor") return <Navigate to="/vendor/status" replace />;
  return <Navigate to="/dashboard/user" replace />;
}

