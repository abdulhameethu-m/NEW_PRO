import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import * as vendorService from "../services/vendorService";

export function VendorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await vendorService.getVendorMe();
        if (!alive) return;
        setVendor(res.data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "Failed to load vendor profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;
  if (error) return <div className="text-sm text-rose-700">{error}</div>;

  if (vendor?.status !== "approved") return <Navigate to="/vendor/status" replace />;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Vendor Dashboard</h1>
        <BackButton />
      </div>

      {/* Shop Info Card */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-600">Shop</div>
        <div className="mt-2 text-lg font-semibold">{vendor.shopName || "—"}</div>
        <p className="mt-1 text-sm text-slate-700">{vendor.description || ""}</p>
        <Link
          to="/seller/products"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Manage Products
        </Link>
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/seller/products"
          className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <div className="text-lg font-semibold text-slate-900">📦 Products</div>
          <div className="mt-1 text-sm text-slate-600">View and manage your products</div>
        </Link>

        <Link
          to="/seller/products/create"
          className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-green-300 hover:bg-green-50"
        >
          <div className="text-lg font-semibold text-slate-900">➕ Add Product</div>
          <div className="mt-1 text-sm text-slate-600">Create a new product listing</div>
        </Link>
      </div>
    </div>
  );
}

