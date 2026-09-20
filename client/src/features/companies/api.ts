import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

export interface Company {
  id: string;
  cik: string;
  name: string;
  ticker: string;
  sector: string | null;
}

export interface Insider {
  id: string;
  name: string;
  cik: string;
  roles: {
    title: string | null;
  }[];
}

export interface Transaction {
  id: string;
  transactionDate: string;
  transactionCode: string;
  shares: number | string;
  pricePerShare: number | string | null;
  totalValue: number | string | null;
}

export interface ClusterHistory {
  id: string;
  windowStart: string;
  windowEnd: string;
  insiderCount: number;
  totalValue: number | string;
  score: number | string;
  createdAt: string;
}

export interface CompanyDashboardResponse {
  company: Company & {
    filings: unknown[];
    clusters: ClusterHistory[];
  };
  currentInsiders: Insider[];
  recentTransactions: Transaction[];
  clusterHistory: ClusterHistory[];
}

export function useCompanyDashboard(companyId: string) {
  return useQuery<CompanyDashboardResponse>({
    queryKey: ["companies", companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<CompanyDashboardResponse>(
        `/companies/${companyId}`,
      );

      return data;
    },
    enabled: Boolean(companyId),
  });
}