import { describe, it, expect, vi, beforeEach } from "vitest";
import { cardRepository } from "../cardRepository";
import { pool } from "../../database/db";

vi.mock("../../database/db", () => ({
  pool: {
    query: vi.fn(),
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
  state: 2,
  due: new Date("2025-06-15"),
  last_review: new Date("2025-06-14"),
  created_at: new Date("2025-06-10"),
  learning_steps: 0,
};

describe("CardRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findByDeckId", () => {
    it("deve retornar cards do deck", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockCard] });

      const result = await cardRepository.findByDeckId("1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("deve retornar array vazio quando deck não tem cards", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await cardRepository.findByDeckId("1");

      expect(result).toEqual([]);
    });
  });

  describe("findDueByDeck", () => {
    it("deve retornar cards devidos ordenados", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockCard] });

      const result = await cardRepository.findDueByDeck("1", 1);

      expect(result).toHaveLength(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("c.due <= NOW()"),
        ["1", 1, 200],
      );
    });

    it("deve retornar array vazio sem cards devidos", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await cardRepository.findDueByDeck("1", 1);

      expect(result).toEqual([]);
    });

    it("deve ordernar review cards antes de new cards", async () => {
      const reviewCard = { ...mockCard, id: 1, state: 2 };
      const newCard = { ...mockCard, id: 2, state: 0 };

      (pool.query as any).mockResolvedValue({ rows: [reviewCard, newCard] });

      const result = await cardRepository.findDueByDeck("1", 1);

      expect(result[0].state).toBe(2);
      expect(result[1].state).toBe(0);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("CASE WHEN c.state = 0 THEN 1 ELSE 0 END"),
        expect.anything(),
      );
    });
  });

  describe("findById", () => {
    it("deve retornar card quando existe e pertence ao usuário", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockCard] });

      const result = await cardRepository.findById("1", 1);

      expect(result).toEqual(mockCard);
    });

    it("deve retornar undefined quando card não existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await cardRepository.findById("999", 1);

      expect(result).toBeUndefined();
    });

    it("deve retornar undefined quando card pertence a outro usuário", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await cardRepository.findById("1", 999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = { query: vi.fn() };
    });

    it("deve criar card com dados mínimos", async () => {
      const newCard = { ...mockCard, id: 2 };
      mockClient.query.mockResolvedValue({ rows: [newCard] });

      const result = await cardRepository.create(newCard, mockClient);

      expect(result.id).toBe(2);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO cards"),
        expect.arrayContaining([1, "Pergunta?", "Resposta."]),
      );
    });

    it("deve preservar stability=0 na criação", async () => {
      const cardWithZeroStability = { ...mockCard, stability: 0 };
      mockClient.query.mockResolvedValue({ rows: [cardWithZeroStability] });

      const result = await cardRepository.create(
        cardWithZeroStability,
        mockClient,
      );

      expect(result.stability).toBe(0);
    });
  });

  describe("updateFsrsData", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = { query: vi.fn() };
    });

    it("deve atualizar dados FSRS do card", async () => {
      const updatedCard = { ...mockCard, stability: 3.5, reps: 2 };
      mockClient.query.mockResolvedValue({ rows: [updatedCard] });

      const result = await cardRepository.updateFsrsData(
        mockClient,
        "1",
        updatedCard,
      );

      expect(result.stability).toBe(3.5);
      expect(result.reps).toBe(2);
    });

    it("deve retornar undefined quando card não encontrado", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await cardRepository.updateFsrsData(
        mockClient,
        "999",
        mockCard,
      );

      expect(result).toBeUndefined();
    });
  });
});
