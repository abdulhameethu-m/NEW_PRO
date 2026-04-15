import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "../services/adminApi";
import { StatusBadge } from "../components/StatusBadge";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await listOrders({ page, limit: 10, ...(status ? { status } : {}) });
      setOrders(res.data.orders);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [page, status]);

  async function handleStatus(orderId, nextStatus) {
    setBusyId(orderId);
    setError("");
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      setOrders((current) => current.map((item) => (item._id === orderId ? res.data : item)));
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {["", "Pending", "Shipped", "Delivered"].map((item) => (
          <button
            key={item || "all"}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${status === item ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}
          >
            {item || "All"}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="grid gap-3 px-4 py-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : orders.length ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {orders.map((order) => (
              <div key={order._id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_1fr_.8fr_.8fr_1fr] lg:items-center lg:px-5">
                <div>
                  <div className="font-semibold text-slate-950 dark:text-white">{order.orderNumber}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <div>{order.userId?.name || "Unknown customer"}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{order.userId?.email || "No email"}</div>
                </div>
                <div className="text-sm font-semibold text-slate-950 dark:text-white">${Number(order.totalAmount || 0).toLocaleString()}</div>
                <div><StatusBadge value={order.status} /></div>
                <div className="flex flex-wrap gap-2">
                  {["Pending", "Shipped", "Delivered"].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={busyId === order._id || order.status === nextStatus}
                      onClick={() => handleStatus(order._id, nextStatus)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {nextStatus}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No orders found.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div>Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} className="rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-700">Previous</button>
          <button type="button" disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))} className="rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-700">Next</button>
        </div>
      </div>
    </div>
  );
}
