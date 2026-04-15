import { useState } from "react";
import { BackButton } from "../components/BackButton";

export function AddressesPage() {
  const [addresses, setAddresses] = useState([]); // Placeholder
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
          <p className="mt-1 text-slate-600">Manage your delivery addresses</p>
        </div>
        <div className="flex items-center gap-3">
          <BackButton fallbackTo="/dashboard/user" />
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Add Address"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Add New Address</h2>
          
          <form className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                placeholder="9785558117"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address Line</label>
              <input
                type="text"
                placeholder="123 Main Street"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">City</label>
              <input
                type="text"
                placeholder="New York"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Postal Code</label>
              <input
                type="text"
                placeholder="10001"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Save Address
            </button>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl">📍</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">No addresses saved</h3>
          <p className="mt-1 text-slate-600">Add your first delivery address to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Addresses will be displayed here */}
        </div>
      )}
    </div>
  );
}
