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
import { ProductsPage } from "./pages/ProductsPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { SellerProductsPage } from "./pages/SellerProductsPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AddressesPage } from "./pages/AddressesPage";
import { SettingsPage } from "./pages/SettingsPage";

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

          {/* User Profile Management Routes - Available to all authenticated users */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<RoleGate roles={["user"]} />}>
            <Route path="/dashboard/user" element={<UserDashboardPage />} />
            <Route path="/shop" element={<ProductsPage />} />
          </Route>

          <Route element={<RoleGate roles={["vendor"]} />}>
            <Route path="/vendor/onboarding" element={<VendorOnboardingPage />} />
            <Route path="/vendor/status" element={<VendorStatusPage />} />
            <Route path="/dashboard/vendor" element={<VendorDashboardPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/products/create" element={<ProductFormPage />} />
            <Route path="/seller/products/:productId/edit" element={<ProductFormPage />} />
          </Route>

          <Route element={<RoleGate roles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/dashboard/admin/vendor/:id" element={<AdminVendorDetailsPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/create" element={<ProductFormPage />} />
            <Route path="/admin/products/:productId/edit" element={<ProductFormPage />} />
          </Route>
        </Route>

        <Route path="/shop" element={<ProductsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
