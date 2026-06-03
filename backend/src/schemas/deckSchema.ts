import { z } from "zod";

export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório.")
    .max(100, "Título muito longo."),

  description: z.string().max(500, "Descrição muito longa.").optional(),

  is_public: z.boolean().optional(),
});

export const updateDeckSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório.")
    .max(100, "Título muito longo."),

  description: z.string().max(500, "Descrição muito longa.").optional().nullable(),

  is_public: z.boolean().optional(),
});

export const settingsSchema = z.object({
  new_cards_per_day: z
    .number()
    .int("Deve ser um número inteiro.")
    .min(0, "Mínimo é 0.")
    .max(100, "Máximo é 100."),
});
