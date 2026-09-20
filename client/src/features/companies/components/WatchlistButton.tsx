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
      className={`border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
        watchlisted
          ? "bg-black text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[3px_3px_0_#000]"
          : "bg-white text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-[3px_3px_0_#000]"
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
    >
      {isPending
        ? "Saving..."
        : watchlisted
          ? "✓ Watchlisted"
          : "+ Add to Watchlist"}
    </button>
  );
}