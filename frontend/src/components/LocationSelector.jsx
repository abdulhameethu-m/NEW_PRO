import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../context/authStore";
import { api } from "../services/api";

export function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Layout Road, Kadampadi, Tamil Nadu");
  const [selectedCoords, setSelectedCoords] = useState(null); // { latitude, longitude }

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");

  const [popularLocations, setPopularLocations] = useState([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState("");

  const user = useAuthStore((s) => s.user);
  const closeBtnRef = useRef(null);

  const closePanel = () => {
    setIsOpen(false);
    setSearchQuery("");
    setDetectError("");
  };

  const openPanel = () => setIsOpen(true);

  useEffect(() => {
    if (!isOpen) return;
    // focus close button for keyboard users
    const t = setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const formatPlace = (parts) => {
    const city = parts?.city || parts?.town || parts?.village || parts?.suburb || parts?.county || "";
    const state = parts?.state || parts?.region || "";
    const country = parts?.country || "";
    return [city, state, country].filter(Boolean).join(", ");
  };

  const reverseGeocode = async ({ latitude, longitude }) => {
    // OSM Nominatim reverse geocoding
    // Note: Browser requests can be rate-limited; handle failures gracefully.
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "10"); // city-level-ish
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("reverse_geocode_failed");
    const data = await res.json();
    const formatted = formatPlace(data?.address);
    if (!formatted) throw new Error("reverse_geocode_empty");
    return formatted;
  };

  const handleUseCurrentLocation = async () => {
    setDetectError("");

    if (!("geolocation" in navigator)) {
      setDetectError("Unable to fetch location");
      return;
    }

    setIsDetecting(true);
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
      });

      const formatted = await reverseGeocode(coords);

      setSelectedCoords(coords);
      setSelectedLocation(formatted);
      closePanel();
    } catch (err) {
      const code = err?.code;
      if (code === 1) setDetectError("Location access denied");
      else setDetectError("Unable to fetch location");
    } finally {
      setIsDetecting(false);
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
    setSelectedCoords(null);
    closePanel();
  };

  const filteredPopular = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return popularLocations;
    return popularLocations.filter((loc) => String(loc).toLowerCase().includes(q));
  }, [popularLocations, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadPopular = async () => {
      setPopularError("");
      setPopularLoading(true);
      try {
        // Expected backend shape: { locations: string[] } OR string[]
        const res = await api.get("/locations/popular");
        const payload = res?.data;
        const locations = Array.isArray(payload) ? payload : payload?.locations;
        const normalized = Array.isArray(locations)
          ? locations.map((x) => String(x)).filter(Boolean)
          : [];
        if (!cancelled) setPopularLocations(normalized);
      } catch (e) {
        if (!cancelled) {
          setPopularLocations([]);
          setPopularError("Unable to load popular locations");
        }
      } finally {
        if (!cancelled) setPopularLoading(false);
      }
    };

    loadPopular();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <>
      {/* Location Display Button */}
      <button
        onClick={openPanel}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <span>📍 {selectedLocation?.length > 30 ? `${selectedLocation.substring(0, 30)}...` : selectedLocation}</span>
        <span className="text-lg">›</span>
      </button>

      {/* Right-side sliding panel */}
      <div
        className={`fixed inset-0 z-[100] ${isOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        {/* Overlay */}
        <button
          type="button"
          onClick={closePanel}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close location panel"
        />

        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-[350px] max-w-[92vw] bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-800 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Select Location"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select Location</h2>
            <button
              ref={closeBtnRef}
              onClick={closePanel}
              className="rounded-md px-2 py-1 text-2xl leading-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(100%-57px)] flex-col">
            <div className="space-y-5 px-5 py-4">
              {/* Search Input (optional local filter for popular list) */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by area, city"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Current Location */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isDetecting}
                className="w-full rounded-xl border border-transparent p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 hover:border-blue-100 hover:bg-blue-50 dark:hover:bg-slate-700"
                type="button"
              >
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <span className="text-xl">📍</span>
                  <span className="font-medium">
                    {isDetecting ? "Detecting location..." : "Use Current Location"}
                  </span>
                </div>
                {detectError ? (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">{detectError}</div>
                ) : null}
              </button>

              {/* Saved Addresses */}
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Saved Addresses</h3>
                {!user ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-900/30">
                    <button
                      onClick={() => (window.location.href = "/login")}
                      className="w-full text-left text-blue-600 hover:underline dark:text-blue-400"
                      type="button"
                    >
                      Login to save addresses
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">No saved addresses</div>
                )}
              </div>

              {/* Popular Locations */}
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Popular Locations</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {popularLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Loading popular locations...
                </div>
              ) : popularError ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {popularError}
                </div>
              ) : filteredPopular.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
                  No popular locations available right now.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPopular.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full rounded-xl p-3 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      type="button"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}

              {/* Fallback local list (only shown if backend returns nothing) */}
              {!popularLoading && filteredPopular.length === 0 ? (
                <div className="mt-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Suggested
                  </div>
                  <div className="space-y-2">
                    {commonLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full rounded-xl p-3 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        type="button"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
