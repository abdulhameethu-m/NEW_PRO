import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, getAnalytics } from "../services/adminApi";
import { StatusBadge } from "../components/StatusBadge";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          getDashboard(),
          getAnalytics(),
        ]);
        if (!alive) return;
        setDashboard(dashboardRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        if (alive) setError(normalizeError(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const totals = dashboard?.totals || {};
  const queues = dashboard?.queues || {};
  const salesOverview = analytics?.salesOverview || [];
  const topProducts = analytics?.topProducts || [];

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Users" value={loading ? "..." : totals.users ?? 0} tone="slate" />
        <MetricCard label="Total Sellers" value={loading ? "..." : totals.sellers ?? 0} tone="blue" />
        <MetricCard label="Total Orders" value={loading ? "..." : totals.orders ?? 0} tone="amber" />
        <MetricCard label="Revenue" value={loading ? "..." : `$${Number(totals.revenue || 0).toLocaleString()}`} tone="emerald" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Sales Overview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 6 recorded revenue periods</p>
            </div>
            <Link to="/admin/analytics" className="text-sm font-medium text-blue-600 hover:underline">
              View analytics
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ) : salesOverview.length ? (
              salesOverview.map((entry) => (
                <div key={entry.label} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {entry.label}
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-white"
                      style={{
                        width: `${Math.max(
                          12,
                          (entry.revenue / Math.max(...salesOverview.map((item) => item.revenue || 0), 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    ${Number(entry.revenue || 0).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No revenue data available yet." />
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Approval Queue</h2>
            <div className="mt-4 grid gap-3">
              <QueueRow label="Pending sellers" value={queues.pendingSellers ?? 0} href="/admin/sellers" />
              <QueueRow label="Pending products" value={queues.pendingProducts ?? 0} href="/admin/products" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Top Products</h2>
              <Link to="/admin/products" className="text-sm font-medium text-blue-600 hover:underline">
                Open catalog
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))
              ) : topProducts.length ? (
                topProducts.map((product) => (
                  <div key={product._id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{product.category}</div>
                      </div>
                      <StatusBadge value={product.status} />
                    </div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Revenue: ${Number(product.analytics?.totalRevenue || 0).toLocaleString()} • Sales: {product.analytics?.salesCount || 0}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No approved product performance yet." />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const tones = {
    slate: "from-slate-950 to-slate-700 text-white",
    blue: "from-blue-600 to-cyan-500 text-white",
    amber: "from-amber-500 to-orange-500 text-white",
    emerald: "from-emerald-500 to-green-500 text-white",
  };

  return (
    <div className={`rounded-3xl bg-gradient-to-br p-5 shadow-sm ${tones[tone]}`}>
      <div className="text-sm font-medium opacity-90">{label}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function QueueRow({ label, value, href }) {
  return (
    <Link to={href} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <span className="text-lg font-semibold text-slate-950 dark:text-white">{value}</span>
    </Link>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {text}
    </div>
  );
}
