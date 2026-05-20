import { describe, it, expect, vi, beforeEach } from "vitest";
import { Rating } from "ts-fsrs";

import { reviewService } from "../reviewService";

import { cardRepository } from "../../repositories/cardRepository";
import { reviewLogRepository } from "../../repositories/reviewLogRepository";
import { pool } from "../../database/db";
import { fsrsService } from "../fsrsService";

vi.mock("../../repositories/cardRepository", () => ({
  cardRepository: {
    findById: vi.fn(),
    findDueByDeck: vi.fn(),
    updateFsrsData: vi.fn(),
  },
}));

vi.mock("../../repositories/reviewLogRepository", () => ({
  reviewLogRepository: {
    create: vi.fn(),
  },
}));

vi.mock("../../services/fsrsService", () => ({
  fsrsService: {
    preview: vi.fn(),
    review: vi.fn(),
  },
}));

vi.mock("../../database/db", () => ({
  pool: {
    connect: vi.fn(),
  },
}));

const mockCard = {
  id: 1,
  deck_id: 1,
  front: "Pergunta?",
  back: "Resposta.",
  stability: 2.5,
  difficulty: 0.5,
  elapsed_days: 1,
  scheduled_days: 1,
  reps: 1,
  lapses: 0,
  state: 1,
  due: new Date(),
  last_review: null,
  created_at: new Date(),
};

describe("ReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitReview", () => {
    it("deve lançar erro com rating inválido", async () => {
      const invalidRating = 99 as Rating;

      await expect(
        reviewService.submitReview("1", 1, invalidRating),
      ).rejects.toThrow("Rating inválido.");
    });

    it("deve lançar erro se card não existe", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(null);

      await expect(
        reviewService.submitReview("999", 1, Rating.Good),
      ).rejects.toThrow("Card não encontrado.");
    });

    it("deve processar revisão com sucesso", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(pool.connect).mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      } as never);

      vi.mocked(fsrsService.review).mockReturnValue({
        card: { ...mockCard, stability: 3.0 },
        log: {
          state: 1,
          stability: 3.0,
          difficulty: 0.4,
          elapsed_days: 1,
          scheduled_days: 3,
          review: new Date(),
        },
      });

      const updatedCard = { ...mockCard, stability: 3.0, scheduled_days: 3 };
      vi.mocked(cardRepository.updateFsrsData).mockResolvedValue(updatedCard);

      const result = await reviewService.submitReview(
        "1",
        1,
        Rating.Good,
      );

      expect(result.card.stability).toBe(3.0);
      expect(result.scheduled_days).toBe(3);
      expect(cardRepository.findById).toHaveBeenCalledWith("1", 1);
    });
  });

  describe("getDueCards", () => {
    it("deve retornar cards devidos", async () => {
      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([mockCard]);

      const result = await reviewService.getDueCards("1", 1);

      expect(result.total).toBe(1);
      expect(result.cards).toEqual([mockCard]);
    });

    it("deve retornar lista vazia se não há cards devidos", async () => {
      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([]);

      const result = await reviewService.getDueCards("1", 1);

      expect(result.total).toBe(0);
      expect(result.cards).toEqual([]);
    });
  });
});
