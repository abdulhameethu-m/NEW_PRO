import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
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
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Vendor Dashboard</h1>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-600">Shop</div>
        <div className="mt-2 text-lg font-semibold">{vendor.shopName || "—"}</div>
        <p className="mt-2 text-sm text-slate-700">
          Placeholder for product management, inventory, orders, payouts.
        </p>
      </div>
    </div>
  );
}

