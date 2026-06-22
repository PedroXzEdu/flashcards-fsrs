import { describe, it, expect, vi, beforeEach } from "vitest";

import { priorityQueueService } from "../priorityQueueService";
import { cardRepository } from "../../repositories/cardRepository";

vi.mock("../../repositories/cardRepository", () => ({
  cardRepository: {
    findDailyQueue: vi.fn(),
  },
}));

function mockCard(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    front: "Pergunta?",
    back: "Resposta.",
    stability: 2.5,
    due: new Date("2025-01-01"),
    state: 2,
    predicted_recall: 50,
    ...overrides,
  };
}

describe("PriorityQueueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDailyQueue", () => {
    it("deve retornar lista vazia quando não há cards", async () => {
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([]);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toEqual([]);
    });

    it("deve usar limit padrão 50 quando não especificado", async () => {
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([]);

      await priorityQueueService.getDailyQueue(1);

      expect(cardRepository.findDailyQueue).toHaveBeenCalledWith(1, 50);
    });

    it("deve aceitar limit personalizado", async () => {
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([]);

      await priorityQueueService.getDailyQueue(1, 10);

      expect(cardRepository.findDailyQueue).toHaveBeenCalledWith(1, 10);
    });

    it("deve isolar cards por usuário via parâmetro userId", async () => {
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([]);

      await priorityQueueService.getDailyQueue(42);

      expect(cardRepository.findDailyQueue).toHaveBeenCalledWith(42, 50);
    });

    it("deve retornar cards com predicted_recall calculado", async () => {
      const card = mockCard();
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([card]);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("predicted_recall");
      expect(typeof result[0].predicted_recall).toBe("number");
    });

    it("deve preservar a ordenação vinda do repositório", async () => {
      const cards = [
        mockCard({ id: 1, predicted_recall: 10 }),
        mockCard({ id: 2, predicted_recall: 50 }),
        mockCard({ id: 3, predicted_recall: 80 }),
      ];

      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue(cards);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(3);
      expect(result[0].predicted_recall).toBe(10);
      expect(result[1].predicted_recall).toBe(50);
      expect(result[2].predicted_recall).toBe(80);
    });

    it("deve funcionar com stability=0 sem quebrar", async () => {
      const card = mockCard({ stability: 0 });
      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([card]);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(1);
      expect(result[0].stability).toBe(0);
      expect(typeof result[0].predicted_recall).toBe("number");
    });

    it("deve funcionar com stability=0 entre outros cards", async () => {
      const normal = mockCard({ id: 1, stability: 3 });
      const zero = mockCard({ id: 2, stability: 0 });

      vi.mocked(cardRepository.findDailyQueue).mockResolvedValue([
        normal,
        zero,
      ]);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(2);
      expect(result.every((c) => typeof c.predicted_recall === "number")).toBe(
        true,
      );
    });
  });
});
