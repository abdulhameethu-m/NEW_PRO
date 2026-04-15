import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import * as adminService from "../services/adminService";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const res = await adminService.listVendors();
      setVendors(res.data);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function approve(id) {
    try {
      await adminService.approveVendor(id);
      await refresh();
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  async function reject(id) {
    const reason = window.prompt("Rejection reason (optional):") || "";
    try {
      await adminService.rejectVendor(id, reason);
      await refresh();
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  async function remove(id) {
    const ok = window.confirm(
      "Remove this vendor? This deletes the vendor profile and revokes vendor privileges (role becomes user)."
    );
    if (!ok) return;
    try {
      await adminService.removeVendor(id);
      await refresh();
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">Manage vendors and products</p>
        </div>
        <div className="flex items-center gap-3">
          <BackButton />
          <button
            onClick={refresh}
            className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/products/create"
          className="rounded-lg border-2 border-green-200 bg-green-50 p-6 shadow-sm transition hover:border-green-400 hover:bg-green-100"
        >
          <div className="text-lg font-semibold text-slate-900">➕ Create Product</div>
          <div className="mt-1 text-sm text-slate-600">Add new product (auto-approved)</div>
        </Link>
        <Link
          to="/admin/products"
          className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <div className="text-lg font-semibold text-slate-900">📦 Review Products</div>
          <div className="mt-1 text-sm text-slate-600">Approve or reject seller products</div>
        </Link>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">👥 Vendors</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{vendors.length}</div>
          <div className="text-sm text-slate-600">Total registered vendors</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {/* Vendors Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Vendor Onboarding</h2>
        
        {loading ? (
          <div className="mt-3 px-4 py-6 text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : vendors.length ? (
          <>
            {/* Desktop Table View (lg and above) */}
            <div className="mt-3 hidden overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm lg:block">
              <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                <div className="col-span-3">Vendor</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Step</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {vendors.map((v) => (
                <div
                  key={v._id}
                  className="grid grid-cols-12 gap-2 border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-sm last:border-b-0"
                >
                  <div className="col-span-3">
                    <div className="font-medium text-slate-900 dark:text-white">{v.userId?.name || "—"}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{v.userId?.email}</div>
                  </div>
                  <div className="col-span-3 text-slate-700 dark:text-slate-200">{v.companyName || "—"}</div>
                  <div className="col-span-2 capitalize text-slate-700 dark:text-slate-200">{v.status}</div>
                  <div className="col-span-2 text-slate-700 dark:text-slate-200">{v.stepCompleted}/4</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Link
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                      to={`/dashboard/admin/vendor/${v._id}`}
                    >
                      View
                    </Link>
                    <button
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      disabled={v.status !== "pending"}
                      onClick={() => approve(v._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 disabled:opacity-50"
                      disabled={v.status !== "pending"}
                      onClick={() => reject(v._id)}
                    >
                      Reject
                    </button>
                    <button
                      className="rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-slate-700"
                      onClick={() => remove(v._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View (below lg) */}
            <div className="mt-3 grid gap-3 lg:hidden">
              {vendors.map((v) => (
                <div
                  key={v._id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{v.userId?.name || "—"}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{v.userId?.email}</p>
                    </div>
                    <span className={`ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize whitespace-nowrap ${
                      v.status === "approved"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : v.status === "rejected"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="mb-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p><span className="font-semibold">Company:</span> {v.companyName || "—"}</p>
                    <p><span className="font-semibold">Progress:</span> Step {v.stepCompleted}/4</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-700"
                      to={`/dashboard/admin/vendor/${v._id}`}
                    >
                      View
                    </Link>
                    <button
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      disabled={v.status !== "pending"}
                      onClick={() => approve(v._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="flex-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 disabled:opacity-50"
                      disabled={v.status !== "pending"}
                      onClick={() => reject(v._id)}
                    >
                      Reject
                    </button>
                    <button
                      className="flex-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-slate-700"
                      onClick={() => remove(v._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-3 px-4 py-6 text-sm text-slate-600 dark:text-slate-300">No vendors yet.</div>
        )}
      </div>
    </div>
  );
}

