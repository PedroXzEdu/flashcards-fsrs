import { api } from "./client";
import type { Card, PreviewRatings } from "../types";

export interface PaginatedResponse<T> {
  cards: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const cardsApi = {
  list: (deckId: number, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Card>>(
      `/decks/${deckId}/cards?page=${page}&limit=${limit}`,
    ),

  create: (deckId: number, front: string, back: string) =>
    api.post<Card>(`/decks/${deckId}/cards`, { front, back }),

  createBatch: (deckId: number, cards: { front: string; back: string }[]) =>
    api.post<Card[]>(`/decks/${deckId}/cards/batch`, { cards }),

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
