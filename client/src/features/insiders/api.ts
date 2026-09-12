import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

export interface Insider {
  id: string;
  cik: string;
  name: string;
  createdAt: string;
}

export interface InsiderRole {
  id: string;
  insiderId: string;
  companyId: string;
  title: string;
  isOfficer: boolean;
  isDirector: boolean;
  isTenPercentOwner: boolean;
  effectiveDate: string | null;
}

export interface Transaction {
  id: string;
  filingId: string;
  transactionCode: string;
  transactionDate: string;
  shares: number | string;
  pricePerShare: number | string | null;
  sharesOwnedAfter: number | string;
  totalValue: number | string | null;
  isDerivative: boolean;
  is10b51: boolean;
  directOrIndirect: string;
  createdAt: string;
}

export interface InsiderProfileResponse {
  insider: Insider;
  roles: InsiderRole[];
  transactionHistory: Transaction[];
  stats: {
    avgPurchaseSize: number;
    purchaseFrequency: number;
  };
}

export function useInsiderProfile(insiderId: string) {
  return useQuery<InsiderProfileResponse>({
    queryKey: ["insiders", insiderId],
    queryFn: async () => {
      const { data } = await apiClient.get<InsiderProfileResponse>(
        `/insiders/${insiderId}`,
      );

      return data;
    },
    enabled: Boolean(insiderId),
  });
}