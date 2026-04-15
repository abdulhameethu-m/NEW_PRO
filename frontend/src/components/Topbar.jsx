import { useAuthStore } from "../context/authStore";

export function Topbar({ title, subtitle, onMenuToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            {subtitle ? (
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || "Admin"}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{user?.role || "admin"}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            {initials}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
