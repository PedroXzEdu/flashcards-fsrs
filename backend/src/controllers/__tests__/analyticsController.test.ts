import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRetentionRate,
  getReviewHeatmap,
  getForgettingCurve,
  getPredictedRecall,
  getWorkloadForecast,
  getDailyQueue,
} from "../analyticsController";
import { analyticsService } from "../../services/analyticsService";
import { priorityQueueService } from "../../services/priorityQueueService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/analyticsService", () => ({
  analyticsService: {
    getRetentionRate: vi.fn(),
    getReviewHeatmap: vi.fn(),
    getForgettingCurve: vi.fn(),
    getPredictedRecall: vi.fn(),
    getWorkloadForecast: vi.fn(),
  },
}));

vi.mock("../../services/priorityQueueService", () => ({
  priorityQueueService: {
    getDailyQueue: vi.fn(),
  },
}));

const mockRetention = { rate: 85.5, total: 100, correct: 85 };

const mockHeatmap = [{ date: "2026-05-28", count: 10 }];

const mockForgettingCurve = {
  stability: 5.0,
  curve: [
    { day: 0, retention: 100 },
    { day: 1, retention: 81.87 },
  ],
};

const mockPredictedRecall = [
  { card_id: 1, front: "Frente", predicted_recall: 85.0 },
];

const mockForecast = [{ date: "2026-05-28", review_count: 10 }];

const mockDailyQueue = [
  {
    id: 1,
    front: "Frente",
    stability: 2.5,
    due: new Date(),
    state: 2,
    predicted_recall: 85.0,
  },
];

function createReq(query: Record<string, unknown> = {}) {
  return { userId: 1, query } as any;
}

function createRes() {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("AnalyticsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRetentionRate", () => {
    it("deve retornar taxa de retenção com success/data", async () => {
      vi.mocked(analyticsService.getRetentionRate).mockResolvedValue(
        mockRetention,
      );

      const req = createReq({ months: 12 });
      const res = createRes();
      const next = vi.fn();

      await getRetentionRate(req, res, next);

      expect(analyticsService.getRetentionRate).toHaveBeenCalledWith(1, 12);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRetention,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se analyticsService.getRetentionRate lançar erro", async () => {
      const error = new AppError("Erro ao calcular retenção.", 500);
      vi.mocked(analyticsService.getRetentionRate).mockRejectedValue(error);

      const req = createReq({ months: 12 });
      const res = createRes();
      const next = vi.fn();

      await getRetentionRate(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getReviewHeatmap", () => {
    it("deve retornar heatmap com success/data", async () => {
      vi.mocked(analyticsService.getReviewHeatmap).mockResolvedValue(
        mockHeatmap,
      );

      const req = createReq({ months: 12 });
      const res = createRes();
      const next = vi.fn();

      await getReviewHeatmap(req, res, next);

      expect(analyticsService.getReviewHeatmap).toHaveBeenCalledWith(1, 12);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHeatmap,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se analyticsService.getReviewHeatmap lançar erro", async () => {
      const error = new AppError("Erro ao buscar heatmap.", 500);
      vi.mocked(analyticsService.getReviewHeatmap).mockRejectedValue(error);

      const req = createReq({ months: 12 });
      const res = createRes();
      const next = vi.fn();

      await getReviewHeatmap(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getForgettingCurve", () => {
    it("deve retornar curva de esquecimento com success/data", async () => {
      vi.mocked(analyticsService.getForgettingCurve).mockResolvedValue(
        mockForgettingCurve,
      );

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getForgettingCurve(req, res, next);

      expect(analyticsService.getForgettingCurve).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockForgettingCurve,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se analyticsService.getForgettingCurve lançar erro", async () => {
      const error = new AppError("Erro ao buscar curva.", 500);
      vi.mocked(analyticsService.getForgettingCurve).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getForgettingCurve(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getPredictedRecall", () => {
    it("deve retornar predicted recall com success/data", async () => {
      vi.mocked(analyticsService.getPredictedRecall).mockResolvedValue(
        mockPredictedRecall,
      );

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getPredictedRecall(req, res, next);

      expect(analyticsService.getPredictedRecall).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPredictedRecall,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se analyticsService.getPredictedRecall lançar erro", async () => {
      const error = new AppError("Erro ao buscar predicted recall.", 500);
      vi.mocked(analyticsService.getPredictedRecall).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getPredictedRecall(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getWorkloadForecast", () => {
    it("deve usar 30 dias como padrão se query.days não for informado", async () => {
      vi.mocked(analyticsService.getWorkloadForecast).mockResolvedValue(
        mockForecast,
      );

      const req = createReq({ days: 30 });
      const res = createRes();
      const next = vi.fn();

      await getWorkloadForecast(req, res, next);

      expect(analyticsService.getWorkloadForecast).toHaveBeenCalledWith(1, 30);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockForecast,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve usar o valor informado se estiver em [7, 14, 30]", async () => {
      vi.mocked(analyticsService.getWorkloadForecast).mockResolvedValue(
        mockForecast,
      );

      const req = createReq({ days: 14 });
      const res = createRes();
      const next = vi.fn();

      await getWorkloadForecast(req, res, next);

      expect(analyticsService.getWorkloadForecast).toHaveBeenCalledWith(1, 14);
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se analyticsService.getWorkloadForecast lançar erro", async () => {
      const error = new AppError("Erro ao buscar forecast.", 500);
      vi.mocked(analyticsService.getWorkloadForecast).mockRejectedValue(error);

      const req = createReq({ days: 30 });
      const res = createRes();
      const next = vi.fn();

      await getWorkloadForecast(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getDailyQueue", () => {
    it("deve retornar fila diária com success/data", async () => {
      vi.mocked(priorityQueueService.getDailyQueue).mockResolvedValue(
        mockDailyQueue,
      );

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getDailyQueue(req, res, next);

      expect(priorityQueueService.getDailyQueue).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDailyQueue,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se priorityQueueService.getDailyQueue lançar erro", async () => {
      const error = new AppError("Erro ao buscar fila.", 500);
      vi.mocked(priorityQueueService.getDailyQueue).mockRejectedValue(error);

      const req = createReq();
      const res = createRes();
      const next = vi.fn();

      await getDailyQueue(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
