import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome muito longo."),

  email: z
    .string()
    .trim()
    .email("Email inválido.")
    .max(254, "Email muito longo."),

  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres.")
    .max(128, "Senha muito longa."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido."),

  password: z.string().min(1, "Senha é obrigatória."),
});
