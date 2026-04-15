import { useAuthStore } from "../context/authStore";
import { BackButton } from "../components/BackButton";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-1 text-slate-600">View and manage your profile information</p>
        </div>
        <BackButton fallbackTo="/dashboard/user" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
          
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900">
                {user?.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900">
                {user?.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <div className="mt-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900">
                {user?.phone || "Not provided"}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <div className="mt-2 rounded border border-slate-300 bg-slate-50 px-3 py-2">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Edit Profile
          </button>
        </div>

        {/* Avatar Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Profile Picture</h3>
          <div className="mt-4 flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-4xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
              Upload Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
