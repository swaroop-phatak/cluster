import { useState } from "react";

interface WatchlistButtonProps {
  companyId: string;
}

export function WatchlistButton({
  companyId,
}: WatchlistButtonProps) {
  const [watchlisted, setWatchlisted] = useState(false);

  function handleClick() {
    setWatchlisted((current) => !current);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-company-id={companyId}
      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
    >
      {watchlisted ? "✓ Watchlisted" : "+ Add to Watchlist"}
    </button>
  );
}