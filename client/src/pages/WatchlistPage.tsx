import { Link } from "react-router-dom";
import {
  useRemoveFromWatchlist,
  useWatchlist,
} from "../features/watchlists/api";

export function WatchlistPage() {
  const { data: watchlist, isLoading, isError } = useWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load your watchlist.
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Watchlist</h1>

        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
            Your watchlist is empty
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add companies to your watchlist to keep track of
            insider activity.
          </p>

          <Link
            to="/clusters"
            className="mt-5 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Browse Clusters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="mt-1 text-sm text-gray-500">
          Companies you're monitoring.
        </p>
      </div>

      <div className="space-y-3">
        {watchlist.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm"
          >
            <Link
              to={`/companies/${entry.company.id}`}
              className="min-w-0"
            >
              <h2 className="font-semibold hover:underline">
                {entry.company.name}
              </h2>

              <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                <span>{entry.company.ticker}</span>

                {entry.company.sector && (
                  <span>{entry.company.sector}</span>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                removeMutation.mutate(entry.companyId)
              }
              disabled={removeMutation.isPending}
              className="ml-4 shrink-0 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}