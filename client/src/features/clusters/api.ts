import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

export interface Cluster {
  id: string;
  score: number;
  insiderCount: number;
  windowStart: string;
  windowEnd: string;
  company: {
    id: string;
    name: string;
    ticker?: string | null;
    sector?: string | null;
  };
}

export interface ClusterFeedResponse {
  data: Cluster[];
  total: number;
}

export interface ClusterFilters {
  minScore?: number;
  sector?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "score" | "date";
}

export function useClusterFeed(filters: ClusterFilters) {
  return useQuery<ClusterFeedResponse>({
    queryKey: ["clusters", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ClusterFeedResponse>(
        "/clusters",
        {
          params: filters,
        },
      );

      return data;
    },
  });
}