import { BackButton } from "../components/BackButton";

export function OrdersPage() {
  const orders = []; // Placeholder - will be populated from API

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-1 text-slate-600">Track and manage your orders</p>
        </div>
        <BackButton fallbackTo="/dashboard/user" />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl">📦</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">No orders yet</h3>
          <p className="mt-1 text-slate-600">Start shopping to place your first order</p>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Orders will be displayed here */}
        </div>
      )}
    </div>
  );
}
