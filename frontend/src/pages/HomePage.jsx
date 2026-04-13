import { Link } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div>
        <p className="text-sm font-medium text-indigo-600">Demo production-grade module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Shop smarter with UChooseMe – where your choices come first.
        </h1>
        <p className="mt-3 text-slate-600">
        UChooseMe brings you a smarter way to shop with unbeatable deals across all your favorite categories. Discover top-quality products, compare prices easily, and make confident choices every time. Enjoy a seamless, secure, and fast shopping experience designed just for you. Start exploring today and find everything you love in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/role"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">What’s included</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700">
          <li>• A wide range of products including electronics, fashion, home essentials, and more</li>
          <li>• Easy product comparison tools to help you choose the best option</li>
          <li>• Genuine customer reviews and ratings for better decision-making</li>
          <li>• Secure payment options with multiple methods</li>
          <li>• Fast delivery and easy return policies</li>
          <li>• 24/7 customer support to help you with any questions or concerns</li>
          <li>• Daily deals, discounts, and special offers</li>
        </ul>
      </div>
    </div>
  );
}

