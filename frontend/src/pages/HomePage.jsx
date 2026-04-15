import { Link } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8">
      {/* Simple Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to UChooseMe</h1>
        <p className="text-lg mb-6 text-blue-100">
          Shop smarter with unbeatable deals across all your favorite categories.
        </p>
        <div className="flex gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/role"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hot Deals */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">🔥 Hot Deals</h2>
          <Link
            to="/shop"
            className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-4">
        <FeatureCard 
          icon="🚚" 
          title="Fast Delivery" 
          description="Quick shipping to your doorstep"
        />
        <FeatureCard 
          icon="🔒" 
          title="Secure Payment" 
          description="Safe and encrypted transactions"
        />
        <FeatureCard 
          icon="↩️" 
          title="Easy Returns" 
          description="Hassle-free return policy"
        />
        <FeatureCard 
          icon="💬" 
          title="24/7 Support" 
          description="Always here to help you"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-md transition border border-slate-200 dark:border-slate-700 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

