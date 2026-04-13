import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import * as authService from "../services/authService";

function normalizeError(err) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}

export function RegisterPage() {
  const [params] = useSearchParams();
  const role = useMemo(() => params.get("role") || "user", [params]);
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.register({ name, email, phone, password, role });
      setAuth(res.data);
      if (role === "vendor") return nav("/vendor/onboarding", { replace: true });
      return nav("/dashboard/user", { replace: true });
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        Register as {role === "vendor" ? "Vendor" : "User"}
      </h1>
      <p className="mt-2 text-slate-600">
        Create your account. Vendors will complete onboarding next.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Email {role === "vendor" ? "" : <span className="text-slate-500">(optional)</span>}
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required={role === "vendor"}
            placeholder={role === "vendor" ? "Required for vendors" : "Optional for users"}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Phone
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            minLength={8}
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
          {loading ? "Creating..." : "Create account"}
        </button>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="text-indigo-600 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

