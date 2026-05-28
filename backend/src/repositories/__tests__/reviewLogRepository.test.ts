import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewLogRepository } from "../reviewLogRepository";

const mockLog = {
  id: 1,
  user_id: 1,
  card_id: 1,
  rating: 3,
  state: 2,
  stability: 2.5,
  difficulty: 0.5,
  elapsed_days: 1,
  scheduled_days: 3,
  review: new Date("2025-06-15"),
};

describe("ReviewLogRepository", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { query: vi.fn() };
  });

  describe("create", () => {
    it("deve criar review log com dados completos", async () => {
      mockClient.query.mockResolvedValue({ rows: [mockLog] });

      const result = await reviewLogRepository.create(mockClient, mockLog);

      expect(result.id).toBe(1);
      expect(result.rating).toBe(3);
      expect(result.stability).toBe(2.5);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO review_logs"),
        expect.arrayContaining([1, 1, 3, 2, 2.5, 0.5, 1, 3, expect.any(Date)]),
      );
    });

    it("deve criar review log com rating mínimo (Again=1)", async () => {
      const againLog = { ...mockLog, rating: 1 };
      mockClient.query.mockResolvedValue({ rows: [againLog] });

      const result = await reviewLogRepository.create(mockClient, againLog);

      expect(result.rating).toBe(1);
    });

    it("deve propagar erro do banco", async () => {
      mockClient.query.mockRejectedValue(new Error("FK violation"));

      await expect(
        reviewLogRepository.create(mockClient, mockLog),
      ).rejects.toThrow("FK violation");
    });
  });
});
