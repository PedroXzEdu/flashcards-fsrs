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

const fsrsParamsSchema = z.object({
  request_retention: z
    .number()
    .min(0.5, "Mínimo é 0.5")
    .max(0.99, "Máximo é 0.99")
    .optional(),
  maximum_interval: z
    .number()
    .int("Deve ser um número inteiro.")
    .min(1, "Mínimo é 1.")
    .max(36500, "Máximo é 36500.")
    .optional(),
  enable_fuzz: z.boolean().optional(),
  enable_short_term: z.boolean().optional(),
  learning_steps: z
    .string()
    .regex(/^\d+[mhd](,\d+[mhd])*$/, "Formato: 1m,10m,60m")
    .optional(),
  relearning_steps: z
    .string()
    .regex(/^\d+[mhd](,\d+[mhd])*$/, "Formato: 10m,1h")
    .optional(),
});

export const settingsSchema = z.object({
  new_cards_per_day: z
    .number()
    .int("Deve ser um número inteiro.")
    .min(0, "Mínimo é 0.")
    .max(100, "Máximo é 100."),
}).merge(fsrsParamsSchema);
