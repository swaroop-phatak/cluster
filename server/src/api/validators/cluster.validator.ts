import { z } from "zod";

export const getClusterFeedSchema = z.object({
  query: z.object({
    minScore: z.coerce.number().optional(),
    sector: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z.enum(["score", "date"]).default("score"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const getClusterDetailSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});