import { api } from "./client";
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
import type { Deck, DeckStats, GlobalStats } from "../types";

export const decksApi = {
  list: () => api.get<Deck[]>("/decks"),

  get: (id: number) => api.get<Deck>(`/decks/${id}`),

  create: (title: string, description: string, is_public: boolean) =>
    api.post<Deck>("/decks", { title, description, is_public }),

  update: (
    id: number,
    title: string,
    description: string,
    is_public: boolean,
  ) => api.put<Deck>(`/decks/${id}`, { title, description, is_public }),

  delete: (id: number) => api.delete<null>(`/decks/${id}`),

  stats: (id: number) => api.get<DeckStats>(`/decks/${id}/stats`),

  updateSettings: (id: number, new_cards_per_day: number) =>
    api.put<Deck>(`/decks/${id}/settings`, { new_cards_per_day }),

  share: (id: number) => api.post<{ token: string }>(`/decks/${id}/share`, {}),

  unshare: (id: number) =>
    api.delete<{ message: string }>(`/decks/${id}/share`),

  getSharedPreview: (token: string) =>
    api.get<{ title: string; description: string; card_count: string }>(
      `/decks/shared/${token}/preview`,
    ),

  importShared: (token: string) =>
    api.post<{ deck: Deck; cards_count: number; message: string }>(
      `/decks/shared/${token}/import`,
      {},
    ),
};

export const importApi = {
  importApkg: async (file: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(error.error || "Erro ao importar.");
    }

    const json = await res.json();
    return json.data;
  },
};

export const statsApi = {
  streak: () =>
    api.get<{
      streak: number;
      longest: number;
      total_days: number;
      last_review: string | null;
    }>("/review-logs/streak"),
  globalStats: () => api.get<GlobalStats>("/review-logs/global-stats"),
};
