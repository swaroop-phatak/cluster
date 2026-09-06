import { z } from "zod";

export const searchCompaniesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    limit: z.coerce.number().max(100).default(20),
  }),
});

export const getCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});