import { useAuthStore } from "../context/authStore";

export function UserDashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">User Dashboard</h1>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-600">Profile</div>
        <div className="mt-3 grid gap-1 text-sm">
          <div>
            <span className="text-slate-500">Name:</span> {user?.name}
          </div>
          <div>
            <span className="text-slate-500">Email:</span> {user?.email}
          </div>
          <div>
            <span className="text-slate-500">Phone:</span> {user?.phone}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-600">Next</div>
        <p className="mt-2 text-sm text-slate-700">
          Placeholder for orders, addresses, and recommendations.
        </p>
      </div>
    </div>
  );
}

