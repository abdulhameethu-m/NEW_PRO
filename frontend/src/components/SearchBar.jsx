import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import * as productService from "../services/productService";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await productService.getPublicProducts({
          search: searchQuery,
          limit: 8,
        });
        setResults(response.data?.products || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-slate-500">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && searchQuery.trim().length > 0 && (
            <div className="p-4 text-center text-slate-500">
              No products found
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                      setShowResults(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ${product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="block p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm border-t border-slate-200 dark:border-slate-700"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
