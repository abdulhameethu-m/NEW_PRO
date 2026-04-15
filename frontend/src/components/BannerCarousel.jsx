import { useState, useEffect } from "react";

export function BannerCarousel({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default banners if none provided
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

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      {/* Slides */}
      <div className="relative h-64 sm:h-80 md:h-96">
        {displayBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-4 sm:px-8">
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 p-2 rounded-full text-slate-900 dark:text-white z-10 transition"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 p-2 rounded-full text-slate-900 dark:text-white z-10 transition"
      >
        ❯
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {displayBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
