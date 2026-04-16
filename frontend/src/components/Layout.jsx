import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import { UserMenu } from "./UserMenu";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { LocationSelector } from "./LocationSelector";
import { useDarkMode } from "../hooks/useDarkMode";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const [isDarkMode] = useDarkMode();
  const location = useLocation();
  const isAdminRoute =
    location.pathname === "/dashboard/admin" ||
    location.pathname.startsWith("/admin");
  const isVendorWorkspace = location.pathname.startsWith("/vendor/");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {!isAdminRoute && !isVendorWorkspace ? (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3">
          <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-3">
            <div className="flex min-w-0 items-center justify-between gap-2 md:contents">
              <div className="min-w-0 md:row-start-1 md:col-start-1">
                <Link to="/" className="block truncate text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
                  UChooseMe
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-2 md:row-start-1 md:col-start-2 md:justify-self-end">
                {user && (
                  <Link
                    to="/shop"
                    className="inline-flex rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-3"
                  >
                    Shop
                  </Link>
                )}
                {user ? (
                  <UserMenu />
                ) : (
                  <>
                    <Link
                      className="hidden text-sm text-slate-700 hover:underline dark:text-slate-200 sm:inline"
                      to="/login"
                    >
                      Login
                    </Link>
                    <Link
                      className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      to="/role"
                    >
                      Start
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="min-w-0 md:row-start-2 md:col-start-1">
              <SearchBar />
            </div>

            <div className="min-w-0 md:row-start-2 md:col-start-2 md:w-[16rem]">
              <LocationSelector />
            </div>
          </div>
        </div>
        </header>
      ) : null}

      <main className={isAdminRoute || isVendorWorkspace ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:py-8"}>
        <Outlet />
      </main>

      {!isAdminRoute && !isVendorWorkspace ? <Footer /> : null}
    </div>
  );
}
