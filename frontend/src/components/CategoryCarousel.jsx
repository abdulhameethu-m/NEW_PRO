import { useState, useRef, useEffect } from "react";

export function CategoryCarousel() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 1, name: "Electronics", icon: "📱", color: "from-blue-400 to-blue-600" },
    { id: 2, name: "Fashion", icon: "👔", color: "from-pink-400 to-pink-600" },
    { id: 3, name: "Home", icon: "🏠", color: "from-yellow-400 to-yellow-600" },
    { id: 4, name: "Books", icon: "📚", color: "from-purple-400 to-purple-600" },
    { id: 5, name: "Sports", icon: "⚽", color: "from-green-400 to-green-600" },
    { id: 6, name: "Toys", icon: "🎮", color: "from-red-400 to-red-600" },
    { id: 7, name: "Beauty", icon: "💄", color: "from-indigo-400 to-indigo-600" },
    { id: 8, name: "Grocery", icon: "🛒", color: "from-orange-400 to-orange-600" },
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="relative bg-white dark:bg-slate-900 py-4 rounded-lg shadow-sm">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 shadow-lg p-2 rounded-r-lg z-10 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          ❮
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex-shrink-0 flex flex-col items-center gap-2 px-3 sm:px-4 py-3 rounded-lg hover:scale-105 transition transform min-w-max bg-gradient-to-br ${category.color} text-white shadow-md hover:shadow-lg`}
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
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 shadow-lg p-2 rounded-l-lg z-10 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          ❯
        </button>
      )}
    </div>
  );
}
