import { describe, it, expect, vi, beforeEach } from "vitest";

import { priorityQueueService } from "../priorityQueueService";
import { pool } from "../../database/db";

vi.mock("../../database/db", () => ({
  pool: {
    query: vi.fn(),
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
    ...overrides,
  };
}

describe("PriorityQueueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDailyQueue", () => {
    it("deve retornar lista vazia quando não há cards", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toEqual([]);
    });

    it("deve usar limit padrão 50 quando não especificado", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

      await priorityQueueService.getDailyQueue(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 50]);
    });

    it("deve aceitar limit personalizado", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

      await priorityQueueService.getDailyQueue(1, 10);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 10]);
    });

    it("deve isolar cards por usuário via parâmetro userId", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

      await priorityQueueService.getDailyQueue(42);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [42, 50]);
    });

    it("deve retornar cards com predicted_recall calculado", async () => {
      const card = mockCard();
      vi.mocked(pool.query).mockResolvedValue({ rows: [card] } as never);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("predicted_recall");
      expect(typeof result[0].predicted_recall).toBe("number");
    });

    it("deve ordenar cards por predicted_recall ASC", async () => {
      const cardA = mockCard({
        id: 1,
        stability: 2,
        due: new Date("2025-06-10"),
      });
      const cardB = mockCard({
        id: 2,
        stability: 10,
        due: new Date("2025-06-14"),
      });
      const cardC = mockCard({
        id: 3,
        stability: 5,
        due: new Date("2025-06-12"),
      });

      vi.mocked(pool.query).mockResolvedValue({
        rows: [cardA, cardB, cardC],
      } as never);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(3);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].predicted_recall).toBeGreaterThanOrEqual(
          result[i - 1].predicted_recall,
        );
      }
    });

    it("deve funcionar com stability=0 sem quebrar", async () => {
      const card = mockCard({ stability: 0 });
      vi.mocked(pool.query).mockResolvedValue({ rows: [card] } as never);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(1);
      expect(result[0].stability).toBe(0);
      expect(typeof result[0].predicted_recall).toBe("number");
    });

    it("deve funcionar com stability=0 entre outros cards", async () => {
      const normal = mockCard({ id: 1, stability: 3 });
      const zero = mockCard({ id: 2, stability: 0 });

      vi.mocked(pool.query).mockResolvedValue({
        rows: [normal, zero],
      } as never);

      const result = await priorityQueueService.getDailyQueue(1);

      expect(result).toHaveLength(2);
      expect(result.every((c) => typeof c.predicted_recall === "number")).toBe(
        true,
      );
    });
  });
});
