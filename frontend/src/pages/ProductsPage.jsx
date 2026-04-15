import { useEffect, useState } from "react";
import { BackButton } from "../components/BackButton";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as productService from "../services/productService";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Filters from URL params
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page")) || 1;

  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: 12,
        ...(category && { category }),
        ...(search && { search }),
        ...(minPrice && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        sortBy,
        sortOrder,
      };

      const res = await productService.getPublicProducts(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    params.set("sortBy", newFilters.sortBy || sortBy);
    params.set("sortOrder", newFilters.sortOrder || sortOrder);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <div className="grid gap-4 sm:gap-6 px-3 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Shop Products</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Discover our curated selection of quality products
          </p>
        </div>
        <BackButton />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3 text-xs sm:text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            category={category}
            search={search}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {showFilters && (
            <div className="mt-3">
              <FilterSidebar
                category={category}
                search={search}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading && !products.length ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 sm:p-8 text-center">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 sm:p-8 text-center">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No products found. Try adjusting your filters.</div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Product Count */}
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Showing {products.length} of {pagination.total} products
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t dark:border-slate-700 pt-4 sm:pt-6">
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Page {page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(pagination.pages, page + 1))}
                      disabled={page === pagination.pages}
                      className="rounded border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  category,
  search,
  minPrice,
  maxPrice,
  sortBy,
  sortOrder,
  onFilterChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({
      category,
      search: localSearch,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      sortBy,
      sortOrder,
    });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    onFilterChange({
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm dark:shadow-slate-950">
      <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Filters</h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-2">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Search</label>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 dark:bg-blue-700 px-2 py-1 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300\">Category</label>
        <select
          value={category}
          onChange={(e) =>
            onFilterChange({
              category: e.target.value,
              search,
              minPrice,
              maxPrice,
              sortBy,
              sortOrder,
            })
          }
          className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-xs sm:text-sm"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing & Fashion</option>
          <option value="Home">Home & Garden</option>
          <option value="Sports">Sports & Outdoors</option>
          <option value="Books">Books & Media</option>
          <option value="Toys">Toys & Games</option>
          <option value="Health">Health & Beauty</option>
          <option value="Food">Food & Beverages</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Price Range</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Min</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              placeholder="Min price"
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Max</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              placeholder="Max price"
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-xs sm:text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="mt-2 w-full rounded bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300"
        >
          Apply
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) =>
            onFilterChange({
              category,
              search,
              minPrice,
              maxPrice,
              sortBy: e.target.value,
              sortOrder,
            })
          }
          className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-xs sm:text-sm"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price (Low to High)</option>
          <option value="ratings.averageRating">Highest Rated</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(search || category || minPrice || maxPrice) && (
        <button
          onClick={handleClearFilters}
          className="w-full rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-950 transition hover:shadow-md dark:hover:shadow-slate-800/50">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-40 sm:h-48 w-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x200?text=Product";
            }}
          />
        ) : (
          <div className="h-40 sm:h-48 bg-slate-200 dark:bg-slate-700" />
        )}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
        </div>

        {/* Rating */}
        {product.ratings?.averageRating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(product.ratings.averageRating) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">({product.ratings.totalReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3">
          {product.discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">${product.discountPrice}</span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-through">${product.price}</span>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">${product.price}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {product.stock > 0 ? (
            <span className="text-green-600 dark:text-green-400">In Stock ({product.stock})</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="mt-3 w-full rounded bg-blue-600 dark:bg-blue-700 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
