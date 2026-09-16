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
      const { data } = await apiClient.get<ClusterFeedResponse>("/clusters", {
        params: filters,
      });

      return data;
    },
  });
}

export interface ClusterDetailTransaction {
  id: string;
  transactionCode: string;
  transactionDate: string;
  shares: number | string;
  pricePerShare: number | string | null;
  totalValue: number | string | null;
  directOrIndirect: string;
  filing: {
    insider: {
      id: string;
      name: string;
      cik: string;
    };
  };
}

export interface ScoreBreakdown {
  insiderCountScore: number;
  roleDiversityScore: number;
  totalValueScore: number;
  windowTightnessScore: number;
}

export interface ClusterDetail {
  id: string;
  companyId: string;

  company: {
    id: string;
    name: string;
    ticker: string;
    sector: string | null;
    cik: string;
  };

  windowStart: string;
  windowEnd: string;
  insiderCount: number;
  totalValue: number | string;
  score: number | string;
  status: string;
  createdAt: string;
  updatedAt: string;

  clusterTransactions: Array<{
    clusterId: string;
    transactionId: string;
    transaction: ClusterDetailTransaction;
  }>;
}

export interface ClusterDetailResponse {
  cluster: ClusterDetail;
  transactions: ClusterDetailTransaction[];
  scoreBreakdown: ScoreBreakdown | null;
}

export function useClusterDetail(clusterId: string) {
  return useQuery<ClusterDetailResponse>({
    queryKey: ["clusters", clusterId],
    queryFn: async () => {
      const { data } = await apiClient.get<ClusterDetailResponse>(
        `/clusters/${clusterId}`,
      );

      return data;
    },
    enabled: Boolean(clusterId),
  });
}
