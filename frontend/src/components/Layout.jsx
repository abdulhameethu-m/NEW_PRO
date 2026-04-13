import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            UChooseMe
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 md:inline">
                  {user.email} • {user.role}
                </span>
                <button
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="text-sm text-slate-700 hover:underline" to="/login">
                  Login
                </Link>
                <Link
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
                  to="/role"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

