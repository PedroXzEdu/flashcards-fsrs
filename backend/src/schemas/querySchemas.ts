import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const analyticsMonthsSchema = z.object({
  months: z.coerce.number().int().min(1).max(120).default(12),
});

export const analyticsDaysSchema = z.object({
  days: z.coerce.number().int().refine((d) => [7, 14, 30].includes(d), {
    message: "days must be one of: 7, 14, 30",
  }).default(30),
});
