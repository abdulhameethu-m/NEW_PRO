import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import * as orderService from "../services/orderService";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  const highlightIds = useMemo(() => {
    const ids = location?.state?.orderIds;
    return Array.isArray(ids) ? new Set(ids.map(String)) : new Set();
  }, [location?.state?.orderIds]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await orderService.listMyOrders({ page: 1, limit: 50 });
      setOrders(res.data.orders || []);
    } catch (e) {
      setError(normalizeError(e));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // clear transient nav state
    if (location?.state?.justPlaced) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  async function cancel(id) {
    setBusyId(id);
    setError("");
    try {
      const res = await orderService.cancelOrder(id);
      const updated = res.data;
      setOrders((cur) => cur.map((o) => (o._id === id ? updated : o)));
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setBusyId("");
    }
  }

  async function requestReturn(id) {
    setBusyId(id);
    setError("");
    try {
      const res = await orderService.returnOrder(id);
      const updated = res.data;
      setOrders((cur) => cur.map((o) => (o._id === id ? updated : o)));
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-1 text-slate-600">Track and manage your orders</p>
        </div>
        <BackButton fallbackTo="/dashboard/user" />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl">📦</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">No orders yet</h3>
          <p className="mt-1 text-slate-600">Start shopping to place your first order</p>
          <Link
            to="/shop"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => {
            const canCancel = ["Pending", "Placed"].includes(order.status);
            const canReturn = order.status === "Delivered";
            const isNew = highlightIds.has(String(order._id));
            return (
              <div
                key={order._id}
                className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${
                  isNew ? "border-emerald-300 ring-2 ring-emerald-200/60 dark:border-emerald-900 dark:ring-emerald-900/30" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950 dark:text-white">{order.orderNumber}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={order.status} />
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                  {(order.items || []).slice(0, 3).map((it) => (
                    <div key={`${order._id}-${it.productId}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate">
                        {it.name} × {it.quantity}
                      </div>
                      <div className="font-semibold text-slate-950 dark:text-white">
                        {formatCurrency(Number(it.price || 0) * Number(it.quantity || 0))}
                      </div>
                    </div>
                  ))}
                  {(order.items || []).length > 3 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      +{(order.items || []).length - 3} more items
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">
                    Total: {formatCurrency(order.totalAmount || 0)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canCancel || busyId === order._id}
                      onClick={() => cancel(order._id)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!canReturn || busyId === order._id}
                      onClick={() => requestReturn(order._id)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Return
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
