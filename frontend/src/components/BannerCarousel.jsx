import { useEffect, useMemo, useRef, useState } from "react";

export function BannerCarousel({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef(null);

  // Default banners if none provided
  const displayBanners = useMemo(() => {
    const defaultBanners = [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop",
        title: "Electronics Deals",
        discount: "Up to 70% OFF",
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1525966222134-fcab75d4e601?w=1200&h=400&fit=crop",
        title: "Fashion Week",
        discount: "Exclusive Collection",
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&h=400&fit=crop",
        title: "Home & Garden",
        discount: "Big Savings",
      },
    ];

    const normalized = Array.isArray(banners) ? banners.filter(Boolean) : [];
    return normalized.length > 0 ? normalized : defaultBanners;
  }, [banners]);

  const slideCount = displayBanners.length;

  useEffect(() => {
    if (currentSlide > slideCount - 1) setCurrentSlide(0);
  }, [currentSlide, slideCount]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const update = () => setPrefersReducedMotion(Boolean(mq.matches));
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener?.(update);
    return () => mq.removeListener?.(update);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (isPaused) return;
    if (slideCount <= 1) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPaused, prefersReducedMotion, slideCount]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideCount);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      tabIndex={0}
    >
      {/* Slides */}
      <div className="relative h-64 sm:h-80 md:h-96">
        {displayBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/60 to-transparent px-4 sm:px-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {banner.title}
              </h2>
              <p className="text-lg sm:text-xl text-yellow-300 font-semibold mt-2">
                {banner.discount}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-700 sm:left-4"
        disabled={slideCount <= 1}
      >
        <span aria-hidden="true">❮</span>
      </button>
      <button
        onClick={nextSlide}
        type="button"
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-700 sm:right-4"
        disabled={slideCount <= 1}
      >
        <span aria-hidden="true">❯</span>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {displayBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
            className={`h-2 w-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 sm:h-3 sm:w-3 ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
