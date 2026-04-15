import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import * as productService from "../services/productService";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productService.getProductById(productId);
        const p = res?.data;

        // Frontend guard: only show approved+active in the user panel.
        if (!p || p.status !== "APPROVED" || p.isActive !== true) {
          throw new Error("NOT_PUBLIC");
        }

        if (!cancelled) {
          setProduct(p);
          setActiveImage(0);
        }
      } catch (e) {
        if (!cancelled) {
          setProduct(null);
          setError(e?.message === "NOT_PUBLIC" ? "Product not available" : "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (productId) load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const images = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    return list
      .map((x) => ({
        url: x?.url || "",
        altText: x?.altText || product?.name || "Product image",
      }))
      .filter((x) => Boolean(x.url));
  }, [product]);

  const primaryPrice = product?.discountPrice || product?.price;
  const hasDiscount = Boolean(product?.discountPrice && product?.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Product</h1>
          <BackButton fallbackTo="/shop" />
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
        <Link
          to="/shop"
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Home / <span className="text-slate-700 dark:text-slate-200">{product.category}</span>
          </div>
          <h1 className="mt-1 truncate text-xl font-semibold text-slate-900 dark:text-white">{product.name}</h1>
        </div>
        <BackButton fallbackTo="/shop" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Media */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {images.length ? (
              <img
                src={images[Math.min(activeImage, images.length - 1)].url}
                alt={images[Math.min(activeImage, images.length - 1)].altText}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/900x900?text=Product";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                No image
              </div>
            )}
            {discountPercent > 0 ? (
              <div className="absolute left-3 top-3 rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                {discountPercent}% OFF
              </div>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 flex-none overflow-hidden rounded-xl border ${
                    idx === activeImage
                      ? "border-blue-600 ring-2 ring-blue-500/30"
                      : "border-slate-200 dark:border-slate-800"
                  } bg-white dark:bg-slate-950`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img.url} alt={img.altText} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  In stock ({product.stock})
                </span>
              ) : (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  Out of stock
                </span>
              )}
              {product?.ratings?.averageRating > 0 ? (
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                  ★ {Number(product.ratings.averageRating).toFixed(1)} ({product.ratings.totalReviews})
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">${primaryPrice}</div>
              {hasDiscount ? (
                <div className="pb-0.5 text-sm text-slate-500 line-through dark:text-slate-400">
                  ${product.price}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={product.stock === 0}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add to cart
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Wishlist
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

