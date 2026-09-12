import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/clusters" className="text-xl font-bold">
            Cluster
          </Link>

          <div className="flex gap-4">
            <Link to="/clusters">Clusters</Link>
            <Link to="/watchlist">Watchlist</Link>
            <Link to="/settings/notifications">Settings</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}