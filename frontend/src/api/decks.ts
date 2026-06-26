import { api } from "./client";
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

  getFsrsParams: (id: number) =>
    api.get<{
      request_retention: number;
      maximum_interval: number;
      enable_fuzz: boolean;
      enable_short_term: boolean;
      learning_steps: string;
      relearning_steps: string;
    } | null>(`/decks/${id}/fsrs-params`),

  updateSettings: (
    id: number,
    settings: {
      new_cards_per_day: number;
      request_retention?: number;
      maximum_interval?: number;
      enable_fuzz?: boolean;
      enable_short_term?: boolean;
      learning_steps?: string;
      relearning_steps?: string;
    },
  ) => api.put<Deck>(`/decks/${id}/settings`, settings),

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

  exportDeck: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/decks/${id}/export`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!res.ok) throw new Error("Erro ao exportar baralho");
    return res.blob();
  },
};

export const importApi = {
  importApkg: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postFormData("/import", formData) as Promise<ImportResult>;
  },

  importCsvTxt: async (file: File, deckId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deck_id", String(deckId));
    return api.postFormData("/import/csv", formData) as Promise<ImportResult>;
  },
};

interface ImportResult {
  deck: { id: number; title: string };
  imported: number;
  skipped: number;
  message: string;
}

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
