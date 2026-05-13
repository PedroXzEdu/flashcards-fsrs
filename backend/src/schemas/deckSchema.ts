import { z } from "zod";

export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório.")
    .max(100, "Título muito longo."),

  description: z.string().max(500, "Descrição muito longa.").optional(),

  is_public: z.boolean().optional(),
});
