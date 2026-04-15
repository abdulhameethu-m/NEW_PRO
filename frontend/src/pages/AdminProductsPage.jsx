import { useEffect, useState } from "react";
import { BackButton } from "../components/BackButton";
import * as productService from "../services/productService";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

export function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [productsRes, statsRes] = await Promise.all([
        productService.getPendingProducts({ page, limit: 10 }),
        productService.getProductStats(),
      ]);
      setProducts(productsRes.data.products);
      setTotalPages(productsRes.data.pagination.pages);
      setStats(statsRes.data);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [page]);

  async function approve(productId) {
    if (!window.confirm("Approve this product?")) return;
    setIsSubmitting(true);
    try {
      await productService.approveProduct(productId);
      setError("");
      setSelectedProduct(null);
      await refresh();
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reject(productId) {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    if (!window.confirm("Reject this product?")) return;
    setIsSubmitting(true);
    try {
      await productService.rejectProduct(productId, rejectReason);
      setError("");
      setRejectReason("");
      setSelectedProduct(null);
      await refresh();
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading && !products.length)
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="text-sm text-slate-600">Loading products...</div>
      </div>
    );

  return (
    <div className="grid gap-4 sm:gap-6 px-3 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Product Management</h1>
          <p className="mt-1 text-sm text-slate-600">Review and approve seller products</p>
        </div>
        <BackButton fallbackTo="/dashboard/admin" />
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          {stats.countByStatus.map((item) => (
            <div key={item._id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">{item._id}</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{item.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Products List */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b px-3 py-3 sm:px-6 hidden lg:block">
          <div className="grid grid-cols-4 gap-4 text-xs font-medium text-slate-700">
            <div>PRODUCT</div>
            <div>SELLER</div>
            <div>PRICE</div>
            <div>ACTIONS</div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No pending products to review.
          </div>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <div key={product._id}>
                {/* Desktop: Grid layout */}
                <div className="hidden lg:grid grid-cols-4 gap-4 px-3 py-4 sm:px-6 border-b">
                  {/* Product Info */}
                  <div>
                    <div className="text-sm font-medium text-slate-900">{product.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{product.SKU}</div>
                  </div>

                  {/* Seller Info */}
                  <div>
                    <div className="text-sm text-slate-700">{product.sellerId?.companyName || "—"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {product.createdBy?.email || "—"}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="text-sm font-medium text-slate-900">${product.price}</div>
                    {product.discountPrice && (
                      <div className="mt-1 text-xs text-green-600">
                        Sale: ${product.discountPrice}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product._id)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      View
                    </button>
                  </div>
                </div>

                {/* Mobile: Card layout */}
                <div className="lg:hidden px-3 py-4 sm:px-6 border-b">
                  <div className="rounded border border-slate-300 p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{product.SKU}</div>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(product._id)}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </button>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium">Seller:</span> {product.sellerId?.companyName || "—"}
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      $ {product.price}
                      {product.discountPrice && (
                        <span className="ml-2 text-xs text-green-600">
                          Sale: ${product.discountPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detail Panel */}
                {selectedProduct === product._id && (
                  <div className="border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-4 sm:px-6">
                    <div className="grid gap-4">
                      {/* Product Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Product Details</h3>
                        <div className="mt-2 space-y-2 text-sm text-slate-700">
                          <div>
                            <span className="font-medium">Name:</span> {product.name}
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>{" "}
                            {product.description}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {product.category}{" "}
                            {product.subCategory && `> ${product.subCategory}`}
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span> {product.stock} units
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Images Preview */}
                      {product.images?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Images</h4>
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {product.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="overflow-hidden rounded border bg-slate-100"
                              >
                                <img
                                  src={img.url}
                                  alt={img.altText || "Product"}
                                  className="h-24 w-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=Image+Error";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason Input */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Provide clear feedback to the seller..."
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(product._id)}
                          disabled={isSubmitting}
                          className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isSubmitting ? "Processing..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => reject(product._id)}
                          disabled={isSubmitting || !rejectReason.trim()}
                          className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isSubmitting ? "Processing..." : "✗ Reject"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setRejectReason("");
                          }}
                          disabled={isSubmitting}
                          className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-slate-600">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
