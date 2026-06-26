import { describe, it, expect, vi, beforeEach } from "vitest";
import { Rating } from "ts-fsrs";

import { reviewService } from "../reviewService";

import { cardRepository } from "../../repositories/cardRepository";
import { deckRepository } from "../../repositories/deckRepository";
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

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    findByIdRaw: vi.fn(),
  },
}));

vi.mock("../../repositories/reviewLogRepository", () => ({
  reviewLogRepository: {
    create: vi.fn(),
  },
}));

vi.mock("../achievementService", () => ({
  achievementService: {
    checkAndUnlock: vi.fn().mockResolvedValue([]),
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
  last_review: undefined,
  created_at: new Date(),
  learning_steps: 0,
};

describe("ReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitReview", () => {
    it("deve lançar erro se card não existe", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(null);

      await expect(
        reviewService.submitReview(999, 1, Rating.Good),
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
          rating: Rating.Good,
          state: 1,
          stability: 3.0,
          difficulty: 0.4,
          elapsed_days: 1,
          scheduled_days: 3,
          last_elapsed_days: 1,
          learning_steps: 0,
          due: new Date(),
          review: new Date(),
        },
      });

      const updatedCard = { ...mockCard, stability: 3.0, scheduled_days: 3 };
      vi.mocked(cardRepository.updateFsrsData).mockResolvedValue(updatedCard);

      const result = await reviewService.submitReview(1, 1, Rating.Good);

      expect(result.card.stability).toBe(3.0);
      expect(result.scheduled_days).toBe(3);
      expect(cardRepository.findById).toHaveBeenCalledWith(1, 1);
    });

    it("deve lançar erro se card pertence a outro usuário", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(null);

      await expect(
        reviewService.submitReview(1, 999, Rating.Good),
      ).rejects.toThrow("Card não encontrado.");
    });

    it("deve fazer rollback se reviewLogRepository.create falha", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(mockCard);

      const release = vi.fn();
      const mockQuery = vi.fn().mockResolvedValue({ rows: [] });

      vi.mocked(pool.connect).mockResolvedValue({
        query: mockQuery,
        release,
      } as never);

      vi.mocked(fsrsService.review).mockReturnValue({
        card: { ...mockCard, stability: 3.0 },
        log: {
          rating: Rating.Good,
          state: 1,
          stability: 3.0,
          difficulty: 0.4,
          elapsed_days: 1,
          scheduled_days: 3,
          last_elapsed_days: 1,
          learning_steps: 0,
          due: new Date(),
          review: new Date(),
        },
      });

      const updatedCard = { ...mockCard, stability: 3.0, scheduled_days: 3 };
      vi.mocked(cardRepository.updateFsrsData).mockResolvedValue(updatedCard);

      vi.mocked(reviewLogRepository.create).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        reviewService.submitReview(1, 1, Rating.Good),
      ).rejects.toThrow("DB error");

      expect(mockQuery).toHaveBeenNthCalledWith(1, "BEGIN");
      expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
      expect(mockQuery).not.toHaveBeenCalledWith("COMMIT");
      expect(cardRepository.updateFsrsData).toHaveBeenCalledTimes(1);
      expect(release).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDueCards", () => {
    it("deve retornar cards devidos", async () => {
      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([mockCard]);
      vi.mocked(deckRepository.findByIdRaw).mockResolvedValue({
        new_cards_per_day: 20,
      });

      const result = await reviewService.getDueCards(1, 1);

      expect(result.total).toBe(1);
      expect(result.cards).toEqual([mockCard]);
    });

    it("deve retornar lista vazia se não há cards devidos", async () => {
      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([]);
      vi.mocked(deckRepository.findByIdRaw).mockResolvedValue({
        new_cards_per_day: 20,
      });

      const result = await reviewService.getDueCards(1, 1);

      expect(result.total).toBe(0);
      expect(result.cards).toEqual([]);
    });

    it("deve limitar cards novos conforme new_cards_per_day", async () => {
      const newCard1 = { ...mockCard, id: 1, state: 0 };
      const newCard2 = { ...mockCard, id: 2, state: 0 };
      const newCard3 = { ...mockCard, id: 3, state: 0 };
      const reviewCard = { ...mockCard, id: 4, state: 2 };

      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([
        reviewCard,
        newCard1,
        newCard2,
        newCard3,
      ]);
      vi.mocked(deckRepository.findByIdRaw).mockResolvedValue({
        new_cards_per_day: 2,
      });

      const result = await reviewService.getDueCards(1, 1);

      expect(result.total).toBe(3);
      expect(result.cards.map((c: any) => c.id)).toEqual([4, 1, 2]);
    });

    it("deve retornar só revisão se new_cards_per_day é 0", async () => {
      const newCard = { ...mockCard, id: 1, state: 0 };
      const reviewCard = { ...mockCard, id: 2, state: 2 };

      vi.mocked(cardRepository.findDueByDeck).mockResolvedValue([
        reviewCard,
        newCard,
      ]);
      vi.mocked(deckRepository.findByIdRaw).mockResolvedValue({
        new_cards_per_day: 0,
      });

      const result = await reviewService.getDueCards(1, 1);

      expect(result.total).toBe(1);
      expect(result.cards.map((c: any) => c.id)).toEqual([2]);
    });
  });

  describe("previewReview", () => {
    it("deve lançar 404 se card não existe", async () => {
      vi.mocked(cardRepository.findById).mockResolvedValue(null);

      await expect(reviewService.previewReview(999, 1)).rejects.toThrow(
        "Card não encontrado.",
      );
    });
  });
});
