import { z } from "zod";

export const getInsiderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});