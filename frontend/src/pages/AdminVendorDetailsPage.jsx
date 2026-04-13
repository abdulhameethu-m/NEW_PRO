import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as adminService from "../services/adminService";
import { resolveApiAssetUrl } from "../utils/resolveUrl";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

export function AdminVendorDetailsPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await adminService.getVendorDetails(id);
      setVendor(res.data);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function approve() {
    try {
      await adminService.approveVendor(id);
      await load();
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  async function reject() {
    const reason = window.prompt("Rejection reason (optional):") || "";
    try {
      await adminService.rejectVendor(id, reason);
      await load();
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  async function remove() {
    const ok = window.confirm(
      "Remove this vendor? This deletes the vendor profile and revokes vendor privileges (role becomes user)."
    );
    if (!ok) return;
    try {
      await adminService.removeVendor(id);
      nav("/dashboard/admin", { replace: true });
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;

  if (error) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Vendor details</h1>
          <Link className="text-sm text-indigo-600 hover:underline" to="/dashboard/admin">
            Back
          </Link>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  const docs = vendor?.documents || [];
  const images = vendor?.shopImages || [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor details</h1>
          <p className="mt-1 text-slate-600">
            Review submitted onboarding information before approval.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
            onClick={() => nav("/dashboard/admin")}
          >
            Back
          </button>
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            onClick={load}
          >
            Refresh
          </button>
        </div>
      </div>

      {vendor?.status === "pending" ? (
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={approve}
          >
            Approve
          </button>
          <button
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            onClick={reject}
          >
            Reject
          </button>
          <button
            className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            onClick={remove}
          >
            Delete vendor
          </button>
        </div>
      ) : (
        <div className="rounded-xl border bg-white px-4 py-3 text-sm">
          Status: <span className="font-semibold capitalize">{vendor?.status}</span>
          {vendor?.rejectionReason ? (
            <span className="text-slate-600"> • {vendor.rejectionReason}</span>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Vendor user" value={vendor?.userId?.name} />
        <Field label="Phone" value={vendor?.userId?.phone} />
        <Field label="Email" value={vendor?.userId?.email} />
        <Field label="Company" value={vendor?.companyName} />
        <Field label="Shop name" value={vendor?.shopName} />
        <Field label="Address" value={vendor?.address} />
        <Field
          label="Location (lat,lng)"
          value={
            vendor?.location?.lat != null && vendor?.location?.lng != null
              ? `${vendor.location.lat}, ${vendor.location.lng}`
              : "—"
          }
        />
        <Field
          label="GST"
          value={vendor?.noGst ? "No GST" : vendor?.gstNumber || "—"}
        />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Bank details</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="Account number" value={vendor?.bankDetails?.accountNumber} />
          <Field label="IFSC" value={vendor?.bankDetails?.IFSC} />
          <Field label="Holder name" value={vendor?.bankDetails?.holderName} />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Verification documents</div>
          <div className="text-xs text-slate-500">{docs.length} file(s)</div>
        </div>
        {docs.length ? (
          <ul className="mt-4 grid gap-2 text-sm">
            {docs.map((d, idx) => (
              <li key={d.url + idx} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{d.originalName || `Document ${idx + 1}`}</div>
                  <div className="text-xs text-slate-500">{d.mimeType} • {(d.size || 0) / 1024 | 0} KB</div>
                </div>
                <a
                  href={resolveApiAssetUrl(d.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-indigo-600 hover:underline"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-slate-600">No documents uploaded.</div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Shop images</div>
          <div className="text-xs text-slate-500">{images.length} image(s)</div>
        </div>
        {images.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {images.map((img, idx) => (
              <a
                key={img.url + idx}
                href={resolveApiAssetUrl(img.url)}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl border"
                title="Open image"
              >
                <img
                  src={resolveApiAssetUrl(img.url)}
                  alt={img.originalName || `Shop image ${idx + 1}`}
                  className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-600">No shop images uploaded.</div>
        )}
      </div>
    </div>
  );
}

