import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "../../watchlists/api";
import { useAuthStore } from "../../../store/useAuthStore";

interface WatchlistButtonProps {
  companyId: string;
}

export function WatchlistButton({
  companyId,
}: WatchlistButtonProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: watchlist } = useWatchlist();

  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const watchlisted =
    watchlist?.some(
      (entry) => entry.companyId === companyId,
    ) ?? false;

  const isPending =
    addMutation.isPending || removeMutation.isPending;

  function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (watchlisted) {
      removeMutation.mutate(companyId);
    } else {
      addMutation.mutate(companyId);
    }
  }

  useEffect(() => {
    if (addMutation.isError || removeMutation.isError) {
      console.error(
        "Watchlist update failed",
        addMutation.error ?? removeMutation.error,
      );
    }
  }, [
    addMutation.isError,
    addMutation.error,
    removeMutation.isError,
    removeMutation.error,
  ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Saving..."
        : watchlisted
          ? "✓ Watchlisted"
          : "+ Add to Watchlist"}
    </button>
  );
}