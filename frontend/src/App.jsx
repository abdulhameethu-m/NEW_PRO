import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGate } from "./components/RoleGate";

import { HomePage } from "./pages/HomePage";
import { RoleSelectionPage } from "./pages/RoleSelectionPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardRedirect } from "./pages/DashboardRedirect";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { VendorDashboardPage } from "./pages/VendorDashboardPage";
import { VendorOnboardingPage } from "./pages/VendorOnboardingPage";
import { VendorStatusPage } from "./pages/VendorStatusPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminVendorDetailsPage } from "./pages/AdminVendorDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/role" element={<RoleSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route element={<RoleGate roles={["user"]} />}>
            <Route path="/dashboard/user" element={<UserDashboardPage />} />
          </Route>

          <Route element={<RoleGate roles={["vendor"]} />}>
            <Route path="/vendor/onboarding" element={<VendorOnboardingPage />} />
            <Route path="/vendor/status" element={<VendorStatusPage />} />
            <Route path="/dashboard/vendor" element={<VendorDashboardPage />} />
          </Route>

          <Route element={<RoleGate roles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/dashboard/admin/vendor/:id" element={<AdminVendorDetailsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
