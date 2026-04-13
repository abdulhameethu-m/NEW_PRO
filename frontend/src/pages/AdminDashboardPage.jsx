import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">Review vendor onboarding submissions.</p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <div className="col-span-3">Vendor</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Step</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">Loading...</div>
        ) : vendors.length ? (
          vendors.map((v) => (
            <div
              key={v._id}
              className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <div className="col-span-3">
                <div className="font-medium">{v.userId?.name || "—"}</div>
                <div className="text-xs text-slate-500">{v.userId?.email}</div>
              </div>
              <div className="col-span-3">{v.companyName || "—"}</div>
              <div className="col-span-2 capitalize">{v.status}</div>
              <div className="col-span-2">{v.stepCompleted}/4</div>
              <div className="col-span-2 flex justify-end gap-2">
                <Link
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                  to={`/dashboard/admin/vendor/${v._id}`}
                >
                  View
                </Link>
                <button
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
                  disabled={v.status !== "pending"}
                  onClick={() => approve(v._id)}
                >
                  Approve
                </button>
                <button
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  disabled={v.status !== "pending"}
                  onClick={() => reject(v._id)}
                >
                  Reject
                </button>
                <button
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                  onClick={() => remove(v._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-slate-600">No vendors yet.</div>
        )}
      </div>
    </div>
  );
}

