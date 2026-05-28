import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyticsRepository } from "../analyticsRepository";
import { pool } from "../../database/db";

vi.mock("../../database/db", () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe("AnalyticsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRetentionRate", () => {
    it("deve retornar valores seguros quando não há review logs", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [
          {
            total_reviews: "0",
            successful_reviews: "0",
            retention_rate: null,
          },
        ],
      });

      const result = await analyticsRepository.getRetentionRate(1);

      expect(result).toBeDefined();
      expect(result.total_reviews).toBe("0");
      expect(result.successful_reviews).toBe("0");
      expect(result.retention_rate).toBeNull();
    });

    it("deve calcular retention rate corretamente com dados", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [
          {
            total_reviews: "10",
            successful_reviews: "8",
            retention_rate: "80.00",
          },
        ],
      });

      const result = await analyticsRepository.getRetentionRate(1);

      expect(result.total_reviews).toBe("10");
      expect(result.successful_reviews).toBe("8");
      expect(result.retention_rate).toBe("80.00");
    });
  });

  describe("getWorkloadForecast", () => {
    it("deve retornar forecast com overdue cards agrupados como today", async () => {
      const today = new Date().toISOString().split("T")[0];

      (pool.query as any).mockResolvedValue({
        rows: [{ day: today, review_cards: 3, new_cards: 1 }],
      });

      const result = await analyticsRepository.getWorkloadForecast(1, 7);

      expect(result).toHaveLength(1);
      expect(result[0].day).toBe(today);
      expect(result[0].review_cards).toBe(3);
      expect(result[0].new_cards).toBe(1);
    });

    it("deve retornar forecast para múltiplos dias sem buckets inválidos", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [
          { day: "2025-06-15", review_cards: 3, new_cards: 1 },
          { day: "2025-06-16", review_cards: 2, new_cards: 0 },
          { day: "2025-06-17", review_cards: 1, new_cards: 2 },
        ],
      });

      const result = await analyticsRepository.getWorkloadForecast(1, 7);

      expect(result).toHaveLength(3);
      for (const row of result) {
        expect(row).toHaveProperty("day");
        expect(row).toHaveProperty("review_cards");
        expect(row).toHaveProperty("new_cards");
        expect(typeof row.review_cards).toBe("number");
        expect(typeof row.new_cards).toBe("number");
      }
    });

    it("deve retornar array vazio sem cards", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await analyticsRepository.getWorkloadForecast(1, 7);

      expect(result).toEqual([]);
    });
  });

  describe("getReviewHeatmap", () => {
    it("deve retornar array vazio sem dados", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await analyticsRepository.getReviewHeatmap(1);

      expect(result).toEqual([]);
    });

    it("deve retornar dados no formato correto com day mapeado", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [
          { day: "2025-01-01", reviews: 5 },
          { day: "2025-01-02", reviews: 3 },
        ],
      });

      const result = await analyticsRepository.getReviewHeatmap(1);

      expect(result).toHaveLength(2);
      for (const row of result) {
        expect(row).toHaveProperty("day");
        expect(row).toHaveProperty("reviews");
        expect(typeof row.reviews).toBe("number");
      }
    });
  });

  describe("getAverageStability", () => {
    it("deve retornar avg_stability null quando não há cards", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [{ avg_stability: null }],
      });

      const result = await analyticsRepository.getAverageStability(1);

      expect(result.avg_stability).toBeNull();
    });

    it("deve retornar avg_stability numérico com dados", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [{ avg_stability: 5.5 }],
      });

      const result = await analyticsRepository.getAverageStability(1);

      expect(result.avg_stability).toBe(5.5);
    });
  });

  describe("getCardsForRecall", () => {
    it("deve retornar array vazio sem cards", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await analyticsRepository.getCardsForRecall(1);

      expect(result).toEqual([]);
    });

    it("deve retornar cards com shape esperado", async () => {
      const dueDate = new Date("2025-06-15");
      (pool.query as any).mockResolvedValue({
        rows: [{ id: 1, front: "test", stability: 2.5, due: dueDate }],
      });

      const result = await analyticsRepository.getCardsForRecall(1);

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("front");
      expect(result[0]).toHaveProperty("stability");
      expect(result[0]).toHaveProperty("due");
      expect(result[0].id).toBe(1);
      expect(result[0].front).toBe("test");
    });
  });

  describe("Empty analytics state", () => {
    it("getRetentionRate não lança exceção sem dados", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [
          {
            total_reviews: "0",
            successful_reviews: "0",
            retention_rate: null,
          },
        ],
      });

      await expect(
        analyticsRepository.getRetentionRate(999),
      ).resolves.not.toThrow();
    });

    it("getReviewHeatmap não lança exceção sem dados", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await expect(
        analyticsRepository.getReviewHeatmap(999),
      ).resolves.not.toThrow();
    });

    it("getAverageStability não lança exceção sem dados", async () => {
      (pool.query as any).mockResolvedValue({
        rows: [{ avg_stability: null }],
      });

      await expect(
        analyticsRepository.getAverageStability(999),
      ).resolves.not.toThrow();
    });

    it("getWorkloadForecast não lança exceção sem dados", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await expect(
        analyticsRepository.getWorkloadForecast(999, 7),
      ).resolves.not.toThrow();
    });

    it("getCardsForRecall não lança exceção sem dados", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await expect(
        analyticsRepository.getCardsForRecall(999),
      ).resolves.not.toThrow();
    });
  });
});
