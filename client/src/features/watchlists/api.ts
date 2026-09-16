import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

export interface WatchlistCompany {
  id: string;
  cik: string;
  name: string;
  ticker: string;
  sector: string | null;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  companyId: string;
  createdAt: string;
  company: WatchlistCompany;
}

export function useWatchlist() {
  return useQuery<WatchlistEntry[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: WatchlistEntry[];
      }>("/watchlists");

      return data.data;
    },
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) =>
      apiClient.post("/watchlists", { companyId }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["watchlist"],
      });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) =>
      apiClient.delete(`/watchlists/${companyId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["watchlist"],
      });
    },
  });
}