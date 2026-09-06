export interface ClusterFilters {
  minScore?: number;
  sector?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "score" | "date";
  page: number;
  pageSize: number;
}