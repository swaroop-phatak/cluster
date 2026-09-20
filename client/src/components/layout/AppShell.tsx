import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/api";
import { useAuthStore } from "../../store/useAuthStore";

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearUser();
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b-2 border-black bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <Link
              to="/clusters"
              className="text-xl font-black tracking-tight transition-transform hover:-translate-y-0.5"
            >
              Cluster
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="border-2 border-black px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] sm:hidden"
              >
                Logout
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm sm:mt-0 sm:justify-end">
            <Link
              to="/clusters"
              className="px-2 py-1 font-semibold transition-all hover:-translate-y-0.5 hover:underline"
            >
              Clusters
            </Link>

            {user ? (
              <>
                <Link
                  to="/watchlist"
                  className="px-2 py-1 font-semibold transition-all hover:-translate-y-0.5 hover:underline"
                >
                  Watchlist
                </Link>

                <Link
                  to="/settings/notifications"
                  className="px-2 py-1 font-semibold transition-all hover:-translate-y-0.5 hover:underline"
                >
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden border-2 border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] sm:inline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2 py-1 font-semibold transition-all hover:-translate-y-0.5 hover:underline"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-2 py-1 font-semibold transition-all hover:-translate-y-0.5 hover:underline"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
