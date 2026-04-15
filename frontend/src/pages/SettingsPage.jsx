import { useState, useEffect } from "react";
import { useAuthStore } from "../context/authStore";
import { BackButton } from "../components/BackButton";
import { useDarkMode } from "../hooks/useDarkMode";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  
  const [settings, setSettings] = useState({
    notifications: true,
    newsletter: true,
    darkMode: isDarkMode,
    twoFactor: false,
  });

  // Sync dark mode state from hook
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      darkMode: isDarkMode,
    }));
  }, [isDarkMode]);

  const handleToggle = (key) => {
    if (key === "darkMode") {
      setIsDarkMode(!isDarkMode);
    } else {
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-slate-600">Manage your preferences and account settings</p>
        </div>
        <BackButton fallbackTo="/dashboard/user" />
      </div>

      <div className="grid gap-6 lg:max-w-2xl">
        {/* Notification Settings */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">Order Updates</div>
                <p className="text-sm text-slate-600">Get notified about your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle("notifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">Newsletter</div>
                <p className="text-sm text-slate-600">Subscribe to our newsletter</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={() => handleToggle("newsletter")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Privacy & Security</h2>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                <p className="text-sm text-slate-600">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={() => handleToggle("twoFactor")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="border-t pt-4">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Display</h2>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">Dark Mode</div>
                <p className="text-sm text-slate-600">Switch to dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle("darkMode")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Delete Account
            </button>
            <p className="text-xs text-red-700">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> You're currently signed in as <strong>{user?.email}</strong> with role{" "}
          <strong className="capitalize">{user?.role}</strong>
        </p>
      </div>
    </div>
  );
}
