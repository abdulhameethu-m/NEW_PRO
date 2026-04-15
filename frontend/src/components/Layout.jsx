import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import { UserMenu } from "./UserMenu";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { LocationSelector } from "./LocationSelector";
import { useDarkMode } from "../hooks/useDarkMode";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const [isDarkMode] = useDarkMode();

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="font-bold text-lg tracking-tight whitespace-nowrap">
              UChooseMe
            </Link>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-sm">
              <SearchBar />
            </div>
            
            {/* Location Selector */}
            <LocationSelector />
            
            {/* Right Nav */}
            <div className="flex items-center gap-3">
              {user && (
                <Link to="/shop" className="text-sm text-slate-700 hover:text-slate-900 hover:underline whitespace-nowrap hidden sm:inline">
                  Shop
                </Link>
              )}
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Link className="text-sm text-slate-700 hover:underline whitespace-nowrap hidden sm:inline" to="/login">
                    Login
                  </Link>
                  <Link
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 whitespace-nowrap"
                    to="/role"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

