import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BannerCarousel } from "../components/BannerCarousel";
import { CategoryCarousel } from "../components/CategoryCarousel";
import * as productService from "../services/productService";
import { formatCurrency } from "../utils/formatCurrency";

export function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [popularPicks, setPopularPicks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const categories = useMemo(
    () => [
      { id: "mobiles", name: "Mobiles", icon: "📱", color: "from-blue-500 to-indigo-600" },
      { id: "electronics", name: "Electronics", icon: "🎧", color: "from-cyan-500 to-blue-600" },
      { id: "fashion", name: "Fashion", icon: "👕", color: "from-pink-500 to-rose-600" },
      { id: "grocery", name: "Grocery", icon: "🛒", color: "from-emerald-500 to-green-600" },
      { id: "home", name: "Home", icon: "🏠", color: "from-amber-500 to-orange-600" },
      { id: "beauty", name: "Beauty", icon: "💄", color: "from-violet-500 to-purple-600" },
      { id: "sports", name: "Sports", icon: "⚽", color: "from-lime-500 to-green-600" },
      { id: "books", name: "Books", icon: "📚", color: "from-fuchsia-500 to-pink-600" },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [popularRes, trendingRes, recommendedRes] = await Promise.all([
          productService.getPublicProducts({ limit: 8, sortBy: "analytics.views", sortOrder: "desc" }),
          productService.getPublicProducts({ limit: 8, sortBy: "createdAt", sortOrder: "desc" }),
          productService.getPublicProducts({ limit: 8, sortBy: "ratings.averageRating", sortOrder: "desc" }),
        ]);

        if (cancelled) return;
        setPopularPicks(popularRes?.data?.products || []);
        setTrending(trendingRes?.data?.products || []);
        setRecommended(recommendedRes?.data?.products || []);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || "Failed to load storefront");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="-mx-3 sm:mx-0">
        <CategoryCarousel
          title="Top Categories"
          categories={categories}
          onSelect={(cat) => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
        />
      </div>

      <BannerCarousel />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <ProductSection
        title="Popular Picks"
        subtitle="Most viewed products right now"
        items={popularPicks}
        loading={loading}
        viewAllHref="/shop?sortBy=analytics.views&sortOrder=desc"
      />

      <ProductSection
        title="Trending"
        subtitle="Fresh arrivals & fast movers"
        items={trending}
        loading={loading}
        viewAllHref="/shop?sortBy=createdAt&sortOrder=desc"
      />

      <ProductSection
        title="Recommended"
        subtitle="Top rated picks"
        items={recommended}
        loading={loading}
        viewAllHref="/shop?sortBy=ratings.averageRating&sortOrder=desc"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TrustBadge title="Fast Delivery" detail="Quick shipping to your doorstep" icon="🚚" />
        <TrustBadge title="Secure Payment" detail="Safe and encrypted transactions" icon="🔒" />
        <TrustBadge title="Easy Returns" detail="Hassle-free return policy" icon="↩️" />
        <TrustBadge title="24/7 Support" detail="Always here to help you" icon="💬" />
      </div>
    </div>
  );
}

function ProductSection({ title, subtitle, items, loading, viewAllHref }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <Link
          to={viewAllHref}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : items?.length ? (
          items.map((p) => <ProductCard key={p._id} product={p} />)
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-300">
            No products to show yet.
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const img = product?.images?.[0]?.url || "";
  const discountPercent = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x450?text=Product";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
            No image
          </div>
        )}

        {discountPercent > 0 ? (
          <div className="absolute left-2 top-2 rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white">
            {discountPercent}% OFF
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <div className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">
          {product.name}
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{product.category}</div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(product.discountPrice)}
                </div>
                <div className="truncate text-xs text-slate-500 line-through dark:text-slate-400">
                  {formatCurrency(product.price)}
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(product.price)}</div>
            )}
          </div>

          {product?.ratings?.averageRating > 0 ? (
            <div className="shrink-0 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
              ★ {Number(product.ratings.averageRating).toFixed(1)}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="aspect-[4/3] animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function TrustBadge({ icon, title, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-slate-800">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
          <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{detail}</div>
        </div>
      </div>
    </div>
  );
}
