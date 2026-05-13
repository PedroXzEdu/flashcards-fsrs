import { api } from "./client";
import type { Card, PreviewRatings } from "../types";

export const cardsApi = {
  list: (deckId: number) => api.get<Card[]>(`/decks/${deckId}/cards`),

  create: (deckId: number, front: string, back: string) =>
    api.post<Card>(`/decks/${deckId}/cards`, { front, back }),

  update: (deckId: number, cardId: number, front: string, back: string) =>
    api.put<Card>(`/decks/${deckId}/cards/${cardId}`, { front, back }),

  delete: (deckId: number, cardId: number) =>
    api.delete<null>(`/decks/${deckId}/cards/${cardId}`),

  forReview: (deckId: number) =>
    api.get<{ cards: Card[]; total: number }>(`/decks/${deckId}/review`),

  preview: (deckId: number, cardId: number) =>
    api.get<PreviewRatings>(`/decks/${deckId}/review/${cardId}/preview`),

  review: (deckId: number, cardId: number, rating: number) =>
    api.post<{ card: Card; next_review: string; scheduled_days: number }>(
      `/decks/${deckId}/review/${cardId}`,
      { rating },
    ),
};
