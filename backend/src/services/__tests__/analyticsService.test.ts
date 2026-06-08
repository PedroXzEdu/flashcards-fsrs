import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyticsService } from "../analyticsService";
import { analyticsRepository } from "../../repositories/analyticsRepository";

vi.mock("../../repositories/analyticsRepository", () => ({
  analyticsRepository: {
    getRetentionRate: vi.fn(),
    getReviewHeatmap: vi.fn(),
    getAverageStability: vi.fn(),
    getWorkloadForecast: vi.fn(),
    getCardsForRecall: vi.fn(),
  },
}));

describe("AnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getForgettingCurve", () => {
    it("deve usar fallback stability=1 quando avg_stability é 0", async () => {
      vi.mocked(analyticsRepository.getAverageStability).mockResolvedValue({
        avg_stability: 0,
      });

      const result = await analyticsService.getForgettingCurve(1);

      expect(result.stability).toBe(1);
      expect(result.curve).toHaveLength(8);
      for (const point of result.curve) {
        expect(point.retention).toBeTypeOf("number");
        expect(Number.isFinite(point.retention)).toBe(true);
        expect(point.retention).toBeGreaterThanOrEqual(0);
        expect(point.retention).toBeLessThanOrEqual(100);
      }
    });

    it("deve usar fallback stability=1 quando avg_stability é null", async () => {
      vi.mocked(analyticsRepository.getAverageStability).mockResolvedValue({
        avg_stability: null,
      });

      const result = await analyticsService.getForgettingCurve(1);

      expect(result.stability).toBe(1);
    });

    it("deve retornar curva com valores decrescentes para stability normal", async () => {
      vi.mocked(analyticsRepository.getAverageStability).mockResolvedValue({
        avg_stability: 10,
      });

      const result = await analyticsService.getForgettingCurve(1);

      expect(result.stability).toBe(10);
      expect(result.curve[0].retention).toBe(100);
      expect(result.curve[1].retention).toBeLessThan(100);
      expect(result.curve[7].retention).toBeLessThan(result.curve[0].retention);
    });
  });

  describe("getPredictedRecall", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("deve retornar 100% recall para cards com due futuro", async () => {
      vi.mocked(analyticsRepository.getCardsForRecall).mockResolvedValue([
        { id: 1, front: "Futuro", stability: 5, due: new Date("2025-06-20") },
      ]);

      const result = await analyticsService.getPredictedRecall(1);

      expect(result[0].predicted_recall).toBe(100);
    });

    it("deve retornar recall menor para cards mais vencidos", async () => {
      vi.mocked(analyticsRepository.getCardsForRecall).mockResolvedValue([
        { id: 1, front: "Card1", stability: 5, due: new Date("2025-06-13") },
        { id: 2, front: "Card2", stability: 5, due: new Date("2025-06-10") },
      ]);

      const result = await analyticsService.getPredictedRecall(1);

      expect(result[0].predicted_recall).toBeGreaterThan(
        result[1].predicted_recall,
      );
    });

    it("deve lidar com stability=0 sem quebrar", async () => {
      vi.mocked(analyticsRepository.getCardsForRecall).mockResolvedValue([
        { id: 1, front: "Zero", stability: 0, due: new Date("2025-06-10") },
      ]);

      const result = await analyticsService.getPredictedRecall(1);

      expect(result).toHaveLength(1);
      expect(result[0].predicted_recall).toBeTypeOf("number");
      expect(Number.isFinite(result[0].predicted_recall)).toBe(true);
    });

    it("não deve produzir NaN ou Infinity", async () => {
      vi.mocked(analyticsRepository.getCardsForRecall).mockResolvedValue([
        { id: 1, front: "Zero", stability: 0, due: new Date("2025-01-01") },
        {
          id: 2,
          front: "Negativo",
          stability: -1,
          due: new Date("2025-06-10"),
        },
        {
          id: 3,
          front: "Grande",
          stability: 999999,
          due: new Date("2025-06-14"),
        },
      ]);

      const result = await analyticsService.getPredictedRecall(1);

      for (const r of result) {
        expect(Number.isFinite(r.predicted_recall)).toBe(true);
      }
    });

    it("deve retornar array vazio sem cards", async () => {
      vi.mocked(analyticsRepository.getCardsForRecall).mockResolvedValue([]);

      const result = await analyticsService.getPredictedRecall(1);

      expect(result).toEqual([]);
    });
  });

  describe("delgação para repository", () => {
    it("getRetentionRate delega ao repository", async () => {
      vi.mocked(analyticsRepository.getRetentionRate).mockResolvedValue({
        total_reviews: "5",
        successful_reviews: "4",
        retention_rate: "80.00",
      });

      const result = await analyticsService.getRetentionRate(1);

      expect(result.retention_rate).toBe("80.00");
      expect(analyticsRepository.getRetentionRate).toHaveBeenCalledWith(1, 12);
    });

    it("getWorkloadForecast delega ao repository", async () => {
      vi.mocked(analyticsRepository.getWorkloadForecast).mockResolvedValue([]);

      const result = await analyticsService.getWorkloadForecast(1, 7);

      expect(result).toEqual([]);
      expect(analyticsRepository.getWorkloadForecast).toHaveBeenCalledWith(
        1,
        7,
      );
    });

    it("getReviewHeatmap delega ao repository", async () => {
      vi.mocked(analyticsRepository.getReviewHeatmap).mockResolvedValue([]);

      const result = await analyticsService.getReviewHeatmap(1);

      expect(result).toEqual([]);
      expect(analyticsRepository.getReviewHeatmap).toHaveBeenCalledWith(1, 12);
    });
  });
});
