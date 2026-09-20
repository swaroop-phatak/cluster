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
        <div className="h-8 w-48 animate-pulse border-2 border-black bg-neutral-100" />
        <div className="h-24 animate-pulse border-2 border-black bg-neutral-100" />
        <div className="h-24 animate-pulse border-2 border-black bg-neutral-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-2 border-red-600 bg-white p-6 shadow-[4px_4px_0_#dc2626]">
        <p className="font-bold uppercase tracking-wide text-red-700">
          Failed to load your watchlist.
        </p>
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Watchlist
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            Companies you're monitoring.
          </p>
        </div>

        <div className="border-2 border-black bg-white p-10 text-center shadow-[5px_5px_0_#000]">
          <h2 className="text-lg font-black uppercase tracking-tight">
            Your watchlist is empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Add companies to your watchlist to keep track of insider
            activity.
          </p>

          <Link
            to="/clusters"
            className="mt-6 inline-block border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[4px_4px_0_#000]"
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
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Watchlist
        </h1>
        <p className="mt-2 text-sm font-medium text-neutral-500">
          Companies you're monitoring.
        </p>
      </div>

      <div className="space-y-3">
        {watchlist.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-4 border-2 border-black bg-white p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              to={`/companies/${entry.company.id}`}
              className="min-w-0"
            >
              <h2 className="font-black uppercase tracking-tight transition-transform hover:underline">
                {entry.company.name}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                <span className="border-2 border-black px-2 py-1">
                  {entry.company.ticker}
                </span>

                {entry.company.sector && (
                  <span className="border-2 border-black px-2 py-1">
                    {entry.company.sector}
                  </span>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                removeMutation.mutate(entry.companyId)
              }
              disabled={removeMutation.isPending}
              className="w-full shrink-0 border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-black disabled:hover:shadow-none sm:w-auto"
            >
              {removeMutation.isPending ? "Removing..." : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}