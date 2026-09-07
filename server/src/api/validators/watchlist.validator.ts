import { z } from "zod";

export const getWatchlistSchema = z.object({
  query: z.object({}),
});

export const addToWatchlistSchema = z.object({
  body: z.object({
    companyId: z.string().uuid(),
  }),
});

export const removeFromWatchlistSchema = z.object({
  params: z.object({
    companyId: z.string().uuid(),
  }),
});