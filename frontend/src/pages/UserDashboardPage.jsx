import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import { BackButton } from "../components/BackButton";
import * as productService from "../services/productService";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function UserDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getPublicProducts({});
        setProducts(res.data.products || []);
      } catch (e) {
        setError(normalizeError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Dashboard</h1>
          <p className="mt-1 text-slate-600">Browse products and manage your account</p>
        </div>
        <BackButton />
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-600">Profile</div>
        <div className="mt-3 grid gap-1 text-sm">
          <div>
            <span className="text-slate-500">Name:</span> {user?.name}
          </div>
          <div>
            <span className="text-slate-500">Email:</span> {user?.email}
          </div>
          <div>
            <span className="text-slate-500">Phone:</span> {user?.phone}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-600">Featured Products</div>
          <Link to="/shop" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No products available yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <Link
                key={product._id}
                to={`/shop`}
                className="rounded-lg border p-3 transition hover:shadow-md"
              >
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-32 w-full rounded object-cover"
                  />
                )}
                <div className="mt-2">
                  <div className="line-clamp-2 text-sm font-medium text-slate-900">
                    {product.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {product.currency} {product.price}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-green-600 font-semibold">Sale</span>
                    )}
                  </div>
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600">In stock</span>
                  ) : (
                    <span className="text-xs text-red-600">Out of stock</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-600">Next</div>
        <p className="mt-2 text-sm text-slate-700">
          Placeholder for orders, addresses, and recommendations.
        </p>
      </div>
    </div>
  );
}

