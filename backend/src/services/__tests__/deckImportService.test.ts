import { describe, it, expect, vi, beforeEach } from "vitest";

import { deckImportService } from "../deckImportService";

import { deckRepository } from "../../repositories/deckRepository";
import { cardRepository } from "../../repositories/cardRepository";
import { pool } from "../../database/db";

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    findByShareToken: vi.fn(),
    createCopy: vi.fn(),
  },
}));

vi.mock("../../repositories/cardRepository", () => ({
  cardRepository: {
    findByDeckId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../database/db", () => ({
  pool: {
    connect: vi.fn(),
  },
}));

const mockSourceDeck = {
  id: 10,
  title: "Deck Compartilhado",
  description: "Descrição do deck",
  user_id: 2,
  share_token: "abc123",
};

const mockNewDeck = {
  id: 20,
  title: "Deck Compartilhado (cópia)",
  description: "Descrição do deck",
  user_id: 1,
};

const mockCard = {
  id: 1,
  deck_id: 10,
  front: "Pergunta?",
  back: "Resposta.",
};

describe("DeckImportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importSharedDeck", () => {
    it("deve importar deck compartilhado com sucesso", async () => {
      vi.mocked(deckRepository.findByShareToken).mockResolvedValue(
        mockSourceDeck,
      );
      vi.mocked(cardRepository.findByDeckId).mockResolvedValue([mockCard]);

      const release = vi.fn();
      const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
      vi.mocked(pool.connect).mockResolvedValue({
        query: mockQuery,
        release,
      } as never);

      vi.mocked(deckRepository.createCopy).mockResolvedValue(mockNewDeck);
      vi.mocked(cardRepository.create).mockResolvedValue({ id: 1 });

      const result = await deckImportService.importSharedDeck("abc123", 1);

      expect(result.deck).toEqual(mockNewDeck);
      expect(result.cards_count).toBe(1);
      expect(result.message).toBe("1 cards importados com sucesso!");
      expect(deckRepository.createCopy).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        "Deck Compartilhado (cópia)",
        "Descrição do deck",
      );
      expect(mockQuery).toHaveBeenCalledWith("BEGIN");
      expect(mockQuery).toHaveBeenCalledWith("COMMIT");
      expect(mockQuery).not.toHaveBeenCalledWith("ROLLBACK");
      expect(release).toHaveBeenCalledTimes(1);
    });

    it("deve importar deck sem cards", async () => {
      vi.mocked(deckRepository.findByShareToken).mockResolvedValue(
        mockSourceDeck,
      );
      vi.mocked(cardRepository.findByDeckId).mockResolvedValue([]);

      const release = vi.fn();
      const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
      vi.mocked(pool.connect).mockResolvedValue({
        query: mockQuery,
        release,
      } as never);

      vi.mocked(deckRepository.createCopy).mockResolvedValue(mockNewDeck);

      const result = await deckImportService.importSharedDeck("abc123", 1);

      expect(result.cards_count).toBe(0);
      expect(result.message).toBe("0 cards importados com sucesso!");
      expect(cardRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro se token é inválido", async () => {
      vi.mocked(deckRepository.findByShareToken).mockResolvedValue(null);

      await expect(
        deckImportService.importSharedDeck("invalid", 1),
      ).rejects.toThrow("Baralho não encontrado ou link inválido.");
    });

    it("deve lançar erro se usuário tenta importar próprio deck", async () => {
      const ownDeck = { ...mockSourceDeck, user_id: 1 };
      vi.mocked(deckRepository.findByShareToken).mockResolvedValue(ownDeck);

      await expect(
        deckImportService.importSharedDeck("abc123", 1),
      ).rejects.toThrow("Você não pode importar seu próprio baralho.");
    });

    it("deve fazer rollback se cardRepository.create falha", async () => {
      vi.mocked(deckRepository.findByShareToken).mockResolvedValue(
        mockSourceDeck,
      );
      vi.mocked(cardRepository.findByDeckId).mockResolvedValue([
        mockCard,
        mockCard,
      ]);

      const release = vi.fn();
      const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
      vi.mocked(pool.connect).mockResolvedValue({
        query: mockQuery,
        release,
      } as never);

      vi.mocked(deckRepository.createCopy).mockResolvedValue(mockNewDeck);
      vi.mocked(cardRepository.create)
        .mockResolvedValueOnce({ id: 1 })
        .mockRejectedValueOnce(new Error("DB error"));

      await expect(
        deckImportService.importSharedDeck("abc123", 1),
      ).rejects.toThrow("DB error");

      expect(mockQuery).toHaveBeenCalledWith("BEGIN");
      expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
      expect(mockQuery).not.toHaveBeenCalledWith("COMMIT");
      expect(release).toHaveBeenCalledTimes(1);
    });
  });
});
