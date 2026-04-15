import { useState, useEffect } from "react";
import { useAuthStore } from "../context/authStore";

export function LocationSelector() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Layout Road, Kadampadi, Tamil Nadu");
  const user = useAuthStore((s) => s.user);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
          setShowModal(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location");
        }
      );
    }
  };

  const commonLocations = [
    "Kadampadi, Tamil Nadu",
    "Chennai, Tamil Nadu",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
    "Delhi, National Capital Region"
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowModal(false);
  };

  return (
    <>
      {/* Location Display Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <span>📍 {selectedLocation.substring(0, 30)}...</span>
        <span className="text-lg">›</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-t-lg sm:rounded-lg w-full sm:w-96 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">Select delivery address</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by area, street name, pin code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Current Location */}
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center gap-3 p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <span className="text-xl">📍</span>
                <span className="font-medium">Use my current location</span>
              </button>

              {/* Divider */}
              <div className="border-t border-dotted border-slate-300 dark:border-slate-600"></div>

              {/* Saved Addresses */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Saved addresses</h3>
                {!user ? (
                  <button
                    onClick={() => window.location.href = "/login"}
                    className="w-full flex items-center gap-3 p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <span className="text-xl">👤</span>
                    <span className="font-medium">Login to see saved addresses</span>
                  </button>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No saved addresses</p>
                )}
              </div>

              {/* Common Locations */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Popular locations</h3>
                <div className="space-y-2">
                  {commonLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
