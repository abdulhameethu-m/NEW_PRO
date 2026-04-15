import { BackButton } from "../components/BackButton";

export function WishlistPage() {
  const wishlistItems = []; // Placeholder - will be populated from API

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="mt-1 text-slate-600">Your saved items and favorites</p>
        </div>
        <BackButton fallbackTo="/dashboard/user" />
      </div>

      {wishlistItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl">❤️</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Your wishlist is empty</h3>
          <p className="mt-1 text-slate-600">Save items to your wishlist to revisit them later</p>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Wishlist items will be displayed here */}
        </div>
      )}
    </div>
  );
}
