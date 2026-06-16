import { describe, it, expect, vi, beforeEach } from "vitest";

import { reviewLogsService } from "../reviewLogsService";

import { reviewLogRepository } from "../../repositories/reviewLogRepository";

vi.mock("../../repositories/reviewLogRepository", () => ({
  reviewLogRepository: {
    findRecent: vi.fn(),
    getDailyStats: vi.fn(),
    getReviewDays: vi.fn(),
    getActivity: vi.fn(),
    getGlobalStats: vi.fn(),
  },
}));

function today() {
  return new Date().toISOString().slice(0, 10);
}

function yesterday() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

const mockLog = {
  id: 1,
  card_id: 1,
  rating: 3,
  stability: 3.0,
  difficulty: 0.4,
  reviewed_at: new Date().toISOString(),
};

const mockGlobalStats = {
  cards: {
    total_cards: 10,
    new_cards: 2,
    learning: 3,
    reviewing: 5,
    due_today: 4,
    avg_difficulty: 0.45,
    avg_stability: 5.2,
  },
  reviews: {
    total_reviews: 100,
    again_count: 10,
    hard_count: 20,
    good_count: 50,
    easy_count: 20,
    retention_rate: 90.0,
  },
  decks: { total_decks: 3 },
  daily: [{ date: "2026-05-28", total: 10 }],
};

describe("ReviewLogsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecent", () => {
    it("deve retornar logs recentes", async () => {
      vi.mocked(reviewLogRepository.findRecent).mockResolvedValue([mockLog]);

      const result = await reviewLogsService.getRecent(1);

      expect(result.logs).toEqual([mockLog]);
      expect(result.total).toBe(1);
    });

    it("deve retornar lista vazia", async () => {
      vi.mocked(reviewLogRepository.findRecent).mockResolvedValue([]);

      const result = await reviewLogsService.getRecent(1);

      expect(result.logs).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getDailyStats", () => {
    it("deve retornar stats diários", async () => {
      const stats = [{ date: today(), reviews: 5 }];
      vi.mocked(reviewLogRepository.getDailyStats).mockResolvedValue(stats);

      const result = await reviewLogsService.getDailyStats(1);

      expect(result.daily_stats).toEqual(stats);
    });

    it("deve retornar stats vazios", async () => {
      vi.mocked(reviewLogRepository.getDailyStats).mockResolvedValue([]);

      const result = await reviewLogsService.getDailyStats(1);

      expect(result.daily_stats).toEqual([]);
    });
  });

  describe("getStreak", () => {
    function mockDays(days: string[]) {
      vi.mocked(reviewLogRepository.getReviewDays).mockResolvedValue({
        days,
        today: today(),
        yesterday: yesterday(),
      });
    }

    it("deve retornar zeros se não há revisões", async () => {
      mockDays([]);

      const result = await reviewLogsService.getStreak(1);

      expect(result).toEqual({
        streak: 0,
        longest: 0,
        total_days: 0,
        last_review: null,
      });
    });

    it("deve retornar zeros se último review não é hoje nem ontem", async () => {
      const threeDaysAgo = daysAgo(3);
      mockDays([threeDaysAgo]);

      const result = await reviewLogsService.getStreak(1);

      expect(result).toEqual({
        streak: 0,
        longest: 0,
        total_days: 1,
        last_review: threeDaysAgo,
      });
    });

    it("deve calcular streak ativo (hoje)", async () => {
      const d = today();
      mockDays([d, daysAgo(1), daysAgo(2)]);

      const result = await reviewLogsService.getStreak(1);

      expect(result.streak).toBe(3);
      expect(result.longest).toBe(3);
      expect(result.total_days).toBe(3);
      expect(result.last_review).toBe(d);
    });

    it("deve calcular streak ativo (ontem)", async () => {
      const y = yesterday();
      mockDays([y, daysAgo(2), daysAgo(3)]);

      const result = await reviewLogsService.getStreak(1);

      expect(result.streak).toBe(3);
      expect(result.longest).toBe(3);
    });

    it("deve calcular longest streak maior que streak atual", async () => {
      const t = today();
      mockDays([t, daysAgo(1), daysAgo(3), daysAgo(4), daysAgo(5)]);

      const result = await reviewLogsService.getStreak(1);

      expect(result.streak).toBe(2);
      expect(result.longest).toBe(3);
      expect(result.total_days).toBe(5);
    });

    it("deve tratar dia único (hoje) como streak 1", async () => {
      mockDays([today()]);

      const result = await reviewLogsService.getStreak(1);

      expect(result.streak).toBe(1);
      expect(result.longest).toBe(1);
      expect(result.total_days).toBe(1);
    });

    it("deve tratar dia único (ontem) como streak 1", async () => {
      mockDays([yesterday()]);

      const result = await reviewLogsService.getStreak(1);

      expect(result.streak).toBe(1);
      expect(result.longest).toBe(1);
      expect(result.total_days).toBe(1);
    });
  });

  describe("getActivity", () => {
    it("deve retornar atividade", async () => {
      const activity = [{ date: today(), count: 10 }];
      vi.mocked(reviewLogRepository.getActivity).mockResolvedValue(activity);

      const result = await reviewLogsService.getActivity(1);

      expect(result.activity).toEqual(activity);
    });

    it("deve retornar atividade vazia", async () => {
      vi.mocked(reviewLogRepository.getActivity).mockResolvedValue([]);

      const result = await reviewLogsService.getActivity(1);

      expect(result.activity).toEqual([]);
    });
  });

  describe("getGlobalStats", () => {
    it("deve retornar stats globais", async () => {
      vi.mocked(reviewLogRepository.getGlobalStats).mockResolvedValue(
        mockGlobalStats,
      );

      const result = await reviewLogsService.getGlobalStats(1);

      expect(result).toEqual(mockGlobalStats);
    });
  });
});
