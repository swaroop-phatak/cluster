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
    <div className="min-h-screen">
      <nav className="border-b px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <Link to="/clusters" className="text-xl font-bold">
              Cluster
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium hover:underline sm:hidden"
              >
                Logout
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:mt-0 sm:justify-end">
            <Link to="/clusters">Clusters</Link>

            {user ? (
              <>
                <Link to="/watchlist">Watchlist</Link>
                <Link to="/settings/notifications">Settings</Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden font-medium hover:underline sm:inline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium hover:underline">
                  Login
                </Link>

                <Link to="/register" className="font-medium hover:underline">
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
