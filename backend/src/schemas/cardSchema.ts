import { z } from "zod";

// Limite de 10.000 caracteres para frente/verso:
// rich text com HTML (negrito, listas, imagens) pode ocupar mais que texto puro.
// O limite de 10K é razoável para conteúdo didático e protege contra payload gigante.

const cardField = z
  .string()
  .trim()
  .min(1, "Campo obrigatório.")
  .max(10_000, "Texto muito longo.");

const tagsField = z
  .array(z.string().trim().max(50, "Tag muito longa."))
  .max(20, "Máximo de 20 tags.")
  .optional();

export const createCardSchema = z.object({
  front: cardField,
  back: cardField,
  tags: tagsField,
});

export const updateCardSchema = z.object({
  front: cardField,
  back: cardField,
  tags: tagsField,
});

export const createCardsBatchSchema = z.object({
  cards: z
    .array(
      z.object({
        front: cardField,
        back: cardField,
        tags: tagsField,
      }),
    )
    .min(1, "Informe pelo menos um card.")
    .max(50, "Máximo de 50 cards por lote."),
});
