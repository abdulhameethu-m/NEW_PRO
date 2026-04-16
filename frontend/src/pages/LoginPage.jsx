import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import * as authService from "../services/authService";
import * as vendorService from "../services/vendorService";

function normalizeError(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

export function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from?.pathname, [location.state]);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setAuth(res.data);

      const role = res.data.user.role;
      if (from) return nav(from, { replace: true });

      if (["admin", "super_admin", "support_admin", "finance_admin"].includes(role)) {
        return nav("/dashboard/admin", { replace: true });
      }
      if (role === "user") return nav("/dashboard/user", { replace: true });

      // vendor
      try {
        const v = await vendorService.getVendorMe();
        const status = v.data.status;
        if (status === "approved") return nav("/dashboard/vendor", { replace: true });
        if (status === "pending") return nav("/vendor/status", { replace: true });
        return nav("/vendor/onboarding", { replace: true });
      } catch {
        return nav("/vendor/onboarding", { replace: true });
      }
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-slate-600">
        Users can login with <span className="font-medium">phone</span>; vendors/admin can use email.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium">
          Email or phone
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            autoComplete="username"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-4 text-center text-sm text-slate-600">
          No account?{" "}
          <Link className="text-indigo-600 hover:underline" to="/role">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
