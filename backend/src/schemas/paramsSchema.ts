import { z } from "zod";

export const deckIdParams = z.object({
  deck_id: z.coerce.number().int().positive(),
});

export const cardParams = z.object({
  deck_id: z.coerce.number().int().positive(),
  card_id: z.coerce.number().int().positive(),
});

export const cardIdCamelParams = z.object({
  cardId: z.coerce.number().int().positive(),
});

export const numericIdParams = z.object({
  id: z.coerce.number().int().positive(),
});
