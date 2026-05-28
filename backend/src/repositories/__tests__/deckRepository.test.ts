import { describe, it, expect, vi, beforeEach } from "vitest";
import { deckRepository } from "../deckRepository";
import { pool } from "../../database/db";

vi.mock("../../database/db", () => ({
  pool: {
    query: vi.fn(),
  },
}));

const mockDeck = {
  id: 1,
  user_id: 1,
  title: "Meu Deck",
  description: "Descrição",
  is_public: false,
  share_token: null,
  new_cards_per_day: 20,
  created_at: new Date("2025-06-01"),
  card_count: "5",
};

describe("DeckRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar deck com dados completos", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockDeck] });

      const result = await deckRepository.create({
        userId: 1,
        title: "Meu Deck",
        description: "Descrição",
        is_public: false,
      });

      expect(result.id).toBe(1);
      expect(result.title).toBe("Meu Deck");
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO decks"),
        [1, "Meu Deck", "Descrição", false],
      );
    });

    it("deve criar deck com valores padrão", async () => {
      const minimalDeck = { ...mockDeck, title: "Mínimo", description: null, is_public: false };
      (pool.query as any).mockResolvedValue({ rows: [minimalDeck] });

      const result = await deckRepository.create({
        userId: 1,
        title: "Mínimo",
      });

      expect(result.title).toBe("Mínimo");
      expect(result.description).toBeNull();
      expect(result.is_public).toBe(false);
    });
  });

  describe("findByUser", () => {
    it("deve retornar decks do usuário com card_count", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockDeck] });

      const result = await deckRepository.findByUser(1);

      expect(result).toHaveLength(1);
      expect(result[0].card_count).toBe("5");
    });

    it("deve retornar array vazio quando usuário não tem decks", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.findByUser(999);

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("deve retornar deck com card_count quando existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockDeck] });

      const result = await deckRepository.findById("1", 1);

      expect(result).toEqual(mockDeck);
    });

    it("deve retornar undefined quando deck não existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.findById("999", 1);

      expect(result).toBeUndefined();
    });
  });

  describe("update", () => {
    it("deve atualizar deck com sucesso", async () => {
      const updatedDeck = { ...mockDeck, title: "Novo Título" };
      (pool.query as any).mockResolvedValue({ rows: [updatedDeck] });

      const result = await deckRepository.update("1", 1, {
        title: "Novo Título",
        description: "Descrição",
        is_public: false,
      });

      expect(result.title).toBe("Novo Título");
    });

    it("deve retornar undefined quando deck não encontrado", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.update("999", 1, {
        title: "Novo",
        description: null,
        is_public: false,
      });

      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("deve deletar deck com sucesso", async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await deckRepository.delete("1", 1);

      expect(result.id).toBe(1);
    });

    it("deve retornar undefined quando deck não encontrado", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.delete("999", 1);

      expect(result).toBeUndefined();
    });
  });

  describe("exists", () => {
    it("deve retornar verdadeiro quando deck existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await deckRepository.exists("1", 1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it("deve retornar undefined quando deck não existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.exists("999", 1);

      expect(result).toBeUndefined();
    });
  });

  describe("getCardStats", () => {
    it("deve retornar estatísticas com cards no deck", async () => {
      const stats = {
        total: "10",
        new_cards: "3",
        learning: "2",
        reviewing: "5",
        due_today: "4",
        avg_difficulty: "0.50",
        avg_stability: "5.20",
        lapses: "2",
      };
      (pool.query as any).mockResolvedValue({ rows: [stats] });

      const result = await deckRepository.getCardStats("1");

      expect(result.total).toBe("10");
      expect(result.new_cards).toBe("3");
      expect(result.reviewing).toBe("5");
      expect(result.avg_difficulty).toBe("0.50");
    });

    it("deve retornar zeros e nulos para deck vazio", async () => {
      const emptyStats = {
        total: "0",
        new_cards: "0",
        learning: "0",
        reviewing: "0",
        due_today: "0",
        avg_difficulty: null,
        avg_stability: null,
        lapses: "0",
      };
      (pool.query as any).mockResolvedValue({ rows: [emptyStats] });

      const result = await deckRepository.getCardStats("1");

      expect(result.total).toBe("0");
      expect(result.avg_difficulty).toBeNull();
      expect(result.avg_stability).toBeNull();
      expect(result.lapses).toBe("0");
    });
  });

  describe("getReviewStats", () => {
    it("deve retornar estatísticas de revisão com dados", async () => {
      const stats = {
        total_reviews: "10",
        again_count: "2",
        hard_count: "1",
        good_count: "5",
        easy_count: "2",
        retention_rate: "80.0",
      };
      (pool.query as any).mockResolvedValue({ rows: [stats] });

      const result = await deckRepository.getReviewStats("1", 1);

      expect(result.total_reviews).toBe("10");
      expect(result.retention_rate).toBe("80.0");
    });

    it("deve retornar retention_rate null sem revisões", async () => {
      const emptyStats = {
        total_reviews: "0",
        again_count: "0",
        hard_count: "0",
        good_count: "0",
        easy_count: "0",
        retention_rate: null,
      };
      (pool.query as any).mockResolvedValue({ rows: [emptyStats] });

      const result = await deckRepository.getReviewStats("1", 1);

      expect(result.total_reviews).toBe("0");
      expect(result.retention_rate).toBeNull();
    });
  });

  describe("updateSettings", () => {
    it("deve atualizar new_cards_per_day", async () => {
      const updatedDeck = { ...mockDeck, new_cards_per_day: 10 };
      (pool.query as any).mockResolvedValue({ rows: [updatedDeck] });

      const result = await deckRepository.updateSettings("1", 1, 10);

      expect(result.new_cards_per_day).toBe(10);
    });

    it("deve retornar undefined quando deck não encontrado", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.updateSettings("999", 1, 10);

      expect(result).toBeUndefined();
    });
  });

  describe("findByIdRaw", () => {
    it("deve retornar deck sem JOIN", async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1, title: "Raw" }] });

      const result = await deckRepository.findByIdRaw("1", 1);

      expect(result.id).toBe(1);
      expect(result.title).toBe("Raw");
    });
  });

  describe("share", () => {
    it("updateShareToken deve atualizar token", async () => {
      const sharedDeck = { ...mockDeck, share_token: "abc123" };
      (pool.query as any).mockResolvedValue({ rows: [sharedDeck] });

      const result = await deckRepository.updateShareToken("1", "abc123");

      expect(result.share_token).toBe("abc123");
    });

    it("removeShareToken deve limpar token", async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await deckRepository.removeShareToken("1", 1);

      expect(result.id).toBe(1);
    });

    it("removeShareToken deve retornar undefined se deck não encontrado", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.removeShareToken("999", 1);

      expect(result).toBeUndefined();
    });

    it("findByShareToken deve retornar deck por token", async () => {
      const sharedDeck = { ...mockDeck, share_token: "abc123" };
      (pool.query as any).mockResolvedValue({ rows: [sharedDeck] });

      const result = await deckRepository.findByShareToken("abc123");

      expect(result.share_token).toBe("abc123");
    });

    it("findByShareToken deve retornar undefined para token inválido", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await deckRepository.findByShareToken("invalido");

      expect(result).toBeUndefined();
    });
  });
});
