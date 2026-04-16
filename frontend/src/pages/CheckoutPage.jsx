import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import * as checkoutService from "../services/checkoutService";
import * as orderService from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

const initialAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await checkoutService.prepareCheckout();
      setSummary(res.data);
    } catch (e) {
      setError(normalizeError(e));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const total = Number(summary?.totalAmount || 0);
  const sellers = useMemo(() => (Array.isArray(summary?.sellers) ? summary.sellers : []), [summary]);

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      const created = await orderService.createOrders({ address, paymentMethod });
      const orders = Array.isArray(created?.data) ? created.data : [];
      // For now we route to orders history. Stripe flow can be layered in with Stripe.js + webhook later.
      navigate("/orders", { replace: true, state: { justPlaced: true, orderIds: orders.map((o) => o._id) } });
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-1 text-slate-600">Confirm delivery details and place your order</p>
        </div>
        <BackButton fallbackTo="/cart" />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : !summary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Unable to prepare checkout. Please review your cart.
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to cart
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Delivery address</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["fullName", "Full name"],
                  ["phone", "Phone"],
                  ["line1", "Address line 1"],
                  ["line2", "Address line 2"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                ].map(([key, label]) => (
                  <label key={key} className={key === "line1" || key === "line2" ? "sm:col-span-2" : ""}>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</div>
                    <input
                      value={address[key]}
                      onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Review items</div>
              <div className="mt-3 grid gap-3">
                {sellers.map((s) => (
                  <div key={String(s.sellerId)} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Seller: {String(s.sellerId)}
                    </div>
                    <div className="mt-2 grid gap-2">
                      {(s.items || []).map((it) => (
                        <div key={String(it.productId)} className="flex items-center justify-between text-sm">
                          <div className="min-w-0 truncate text-slate-700 dark:text-slate-200">
                            {it.name} × {it.quantity}
                          </div>
                          <div className="font-semibold text-slate-950 dark:text-white">
                            {formatCurrency(Number(it.price || 0) * Number(it.quantity || 0))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(s.subtotal || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Payment method</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["cod", "Cash on delivery"],
                  ["stripe", "Stripe (requires keys)"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${
                      paymentMethod === value
                        ? "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200"
                        : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {paymentMethod === "stripe" ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  Stripe is enabled on the backend, but the frontend is not yet collecting card details (Stripe.js).
                  We can add a production-ready Stripe checkout UI next.
                </div>
              ) : null}
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Order summary</div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.subtotal || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.shippingFee || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.taxAmount || 0)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                <span className="font-semibold">Total</span>
                <span className="text-base font-extrabold text-slate-950 dark:text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={placing}
              onClick={placeOrder}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {placing ? "Placing order..." : "Place order"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Back to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

