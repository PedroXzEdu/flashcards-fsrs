import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int("Rating deve ser um número inteiro.")
    .min(1, "Rating inválido.")
    .max(4, "Rating inválido."),
});
