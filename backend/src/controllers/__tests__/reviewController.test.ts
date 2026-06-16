import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReviewCards,
  previewReview,
  submitReview,
} from "../reviewController";
import { reviewService } from "../../services/reviewService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/reviewService", () => ({
  reviewService: {
    getDueCards: vi.fn(),
    previewReview: vi.fn(),
    submitReview: vi.fn(),
  },
}));

const mockDueCards = {
  cards: [{ id: 1, front: "Frente", state: 1, stability: 2.5 }],
  total: 1,
};

const mockReviewPreview = {
  again: { due: new Date(), scheduled_days: 1 },
  hard: { due: new Date(), scheduled_days: 2 },
  good: { due: new Date(), scheduled_days: 3 },
  easy: { due: new Date(), scheduled_days: 7 },
};

const mockReviewResult = {
  card: { id: 1, stability: 5.0 },
  review: {
    rating: 3,
    state: 2,
    due: new Date(),
    stability: 5.0,
    difficulty: 4.0,
    elapsed_days: 0,
    last_elapsed_days: 0,
    scheduled_days: 2,
    learning_steps: 0,
    review: new Date(),
  },
  next_review: new Date(),
  scheduled_days: 2,
};

function createReq(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
) {
  return { params, body, userId: 1 } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("ReviewController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReviewCards", () => {
    it("deve retornar cards devidos com success/data", async () => {
      vi.mocked(reviewService.getDueCards).mockResolvedValue(mockDueCards);

      const req = createReq({ deck_id: "1" });
      const res = createRes();
      const next = vi.fn();

      await getReviewCards(req, res, next);

      expect(reviewService.getDueCards).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDueCards,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewService.getDueCards lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(reviewService.getDueCards).mockRejectedValue(error);

      const req = createReq({ deck_id: "999" });
      const res = createRes();
      const next = vi.fn();

      await getReviewCards(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("previewReview", () => {
    it("deve retornar preview da revisão com success/data", async () => {
      vi.mocked(reviewService.previewReview).mockResolvedValue(
        mockReviewPreview,
      );

      const req = createReq({ cardId: "1" });
      const res = createRes();
      const next = vi.fn();

      await previewReview(req, res, next);

      expect(reviewService.previewReview).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReviewPreview,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewService.previewReview lançar erro", async () => {
      const error = new AppError("Card não encontrado.", 404);
      vi.mocked(reviewService.previewReview).mockRejectedValue(error);

      const req = createReq({ cardId: "999" });
      const res = createRes();
      const next = vi.fn();

      await previewReview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("submitReview", () => {
    it("deve submeter review e retornar resultado com success/data", async () => {
      vi.mocked(reviewService.submitReview).mockResolvedValue(mockReviewResult);

      const req = createReq({ cardId: "1" }, { rating: 3 });
      const res = createRes();
      const next = vi.fn();

      await submitReview(req, res, next);

      expect(reviewService.submitReview).toHaveBeenCalledWith(1, 1, 3);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReviewResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se reviewService.submitReview lançar erro", async () => {
      const error = new AppError("Card não encontrado.", 404);
      vi.mocked(reviewService.submitReview).mockRejectedValue(error);

      const req = createReq({ cardId: "999" }, { rating: 3 });
      const res = createRes();
      const next = vi.fn();

      await submitReview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
