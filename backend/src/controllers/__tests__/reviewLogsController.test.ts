import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReviewLogs,
  getDailyStats,
  getStreak,
  getActivity,
  getGlobalStats,
} from "../reviewLogsController";
import { reviewLogsService } from "../../services/reviewLogsService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/reviewLogsService", () => ({
  reviewLogsService: {
    getRecent: vi.fn(),
    getDailyStats: vi.fn(),
    getStreak: vi.fn(),
    getActivity: vi.fn(),
    getGlobalStats: vi.fn(),
  },
}));

const mockLogs = {
  logs: [{ id: 1, rating: 3, reviewed_at: "2026-05-28" }],
  total: 1,
};

const mockDailyStats = {
  daily_stats: [{ date: "2026-05-28", count: 10 }],
};

const mockStreak = {
  streak: 5,
  longest: 10,
  total_days: 50,
  last_review: "2026-05-28",
};

const mockActivity = {
  activity: [{ date: "2026-05-28", count: 10 }],
};

const mockGlobalStats = {
  cards: {
    total_cards: 50,
    new_cards: 10,
    learning: 5,
    reviewing: 35,
    due_today: 8,
    avg_difficulty: 5.5,
    avg_stability: 3.2,
  },
  reviews: {
    total_reviews: 100,
    again_count: 20,
    hard_count: 15,
    good_count: 50,
    easy_count: 15,
    retention_rate: 80.0,
  },
  decks: { total_decks: 3 },
  daily: [{ date: "2026-05-28", total: 10 }],
};

function createReq() {
  return { userId: 1 } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("ReviewLogsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReviewLogs", () => {
    it("deve retornar logs com success/data", async () => {
      vi.mocked(reviewLogsService.getRecent).mockResolvedValue(mockLogs);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getReviewLogs(req, res, next);

      expect(reviewLogsService.getRecent).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewLogsService.getRecent lançar erro", async () => {
      const error = new AppError("Erro ao buscar logs.", 500);
      vi.mocked(reviewLogsService.getRecent).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getReviewLogs(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getDailyStats", () => {
    it("deve retornar estatísticas diárias com success/data", async () => {
      vi.mocked(reviewLogsService.getDailyStats).mockResolvedValue(
        mockDailyStats,
      );

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getDailyStats(req, res, next);

      expect(reviewLogsService.getDailyStats).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDailyStats,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewLogsService.getDailyStats lançar erro", async () => {
      const error = new AppError("Erro ao buscar estatísticas.", 500);
      vi.mocked(reviewLogsService.getDailyStats).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getDailyStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getStreak", () => {
    it("deve retornar streak com success/data", async () => {
      vi.mocked(reviewLogsService.getStreak).mockResolvedValue(mockStreak);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getStreak(req, res, next);

      expect(reviewLogsService.getStreak).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStreak,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewLogsService.getStreak lançar erro", async () => {
      const error = new AppError("Erro ao buscar streak.", 500);
      vi.mocked(reviewLogsService.getStreak).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getStreak(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getActivity", () => {
    it("deve retornar activity com success/data", async () => {
      vi.mocked(reviewLogsService.getActivity).mockResolvedValue(mockActivity);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getActivity(req, res, next);

      expect(reviewLogsService.getActivity).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivity,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewLogsService.getActivity lançar erro", async () => {
      const error = new AppError("Erro ao buscar atividade.", 500);
      vi.mocked(reviewLogsService.getActivity).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getActivity(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getGlobalStats", () => {
    it("deve retornar estatísticas globais com success/data", async () => {
      vi.mocked(reviewLogsService.getGlobalStats).mockResolvedValue(
        mockGlobalStats,
      );

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getGlobalStats(req, res, next);

      expect(reviewLogsService.getGlobalStats).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockGlobalStats,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewLogsService.getGlobalStats lançar erro", async () => {
      const error = new AppError("Erro ao buscar estatísticas globais.", 500);
      vi.mocked(reviewLogsService.getGlobalStats).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getGlobalStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
