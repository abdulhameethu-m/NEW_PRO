import { useEffect, useMemo, useRef, useState } from "react";

export function CategoryCarousel({
  categories: categoriesProp,
  onSelect,
  title = "Categories",
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const categories = useMemo(() => {
    const fallback = [
      { id: 1, name: "Electronics", icon: "📱", color: "from-blue-400 to-blue-600" },
      { id: 2, name: "Fashion", icon: "👔", color: "from-pink-400 to-pink-600" },
      { id: 3, name: "Home", icon: "🏠", color: "from-yellow-400 to-yellow-600" },
      { id: 4, name: "Books", icon: "📚", color: "from-purple-400 to-purple-600" },
      { id: 5, name: "Sports", icon: "⚽", color: "from-green-400 to-green-600" },
      { id: 6, name: "Toys", icon: "🎮", color: "from-red-400 to-red-600" },
      { id: 7, name: "Beauty", icon: "💄", color: "from-indigo-400 to-indigo-600" },
      { id: 8, name: "Grocery", icon: "🛒", color: "from-orange-400 to-orange-600" },
    ];
    const normalized = Array.isArray(categoriesProp) ? categoriesProp.filter(Boolean) : [];
    return normalized.length ? normalized : fallback;
  }, [categoriesProp]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(240, Math.floor(scrollContainerRef.current.clientWidth * 0.75));
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const raf = window.requestAnimationFrame(handleScroll);
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      return () => {
        window.cancelAnimationFrame(raf);
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll("left");
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll("right");
    }
  };

  return (
    <div className="relative rounded-2xl bg-white py-4 shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          type="button"
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-xl bg-white p-2 shadow-lg transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">❮</span>
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2 scroll-smooth sm:gap-4 sm:px-6 snap-x snap-mandatory"
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Category carousel"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect?.(category)}
            className={`snap-start flex min-w-max flex-shrink-0 flex-col items-center gap-2 rounded-xl bg-gradient-to-br px-3 py-3 text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 ${category.color}`}
          >
            <span className="text-2xl sm:text-3xl">{category.icon}</span>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          type="button"
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-xl bg-white p-2 shadow-lg transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">❯</span>
        </button>
      )}
    </div>
  );
}
