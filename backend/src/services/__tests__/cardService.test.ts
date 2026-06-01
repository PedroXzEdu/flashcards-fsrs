import { describe, it, expect, vi, beforeEach } from "vitest";

import { cardService } from "../cardService";

import { cardRepository } from "../../repositories/cardRepository";
import { deckRepository } from "../../repositories/deckRepository";

vi.mock("../../repositories/cardRepository", () => ({
  cardRepository: {
    create: vi.fn(),
    findByDeckId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    findById: vi.fn(),
  },
}));

const mockDeck = { id: 1, title: "Meu Deck", user_id: 1 };
const mockCard = {
  id: 1,
  deck_id: 1,
  front: "Frente",
  back: "Verso",
  stability: 2.5,
  difficulty: 0.5,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 0,
  lapses: 0,
  state: 0,
  due: new Date(),
};

describe("CardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um card", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.create).mockResolvedValue(mockCard);

      const result = await cardService.create("1", 1, {
        front: "Frente",
        back: "Verso",
      });

      expect(result).toEqual(mockCard);
      expect(deckRepository.findById).toHaveBeenCalledWith("1", 1);
      expect(cardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deck_id: 1,
          front: "Frente",
          back: "Verso",
        }),
      );
    });

    it("deve lançar erro se deck não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(null);

      await expect(
        cardService.create("999", 1, { front: "F", back: "B" }),
      ).rejects.toThrow("Baralho não encontrado.");
    });
  });

  describe("list", () => {
    it("deve listar cards do deck", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.findByDeckId).mockResolvedValue([mockCard]);

      const result = await cardService.list("1", 1);

      expect(result).toEqual([mockCard]);
      expect(cardRepository.findByDeckId).toHaveBeenCalledWith("1");
    });

    it("deve lançar erro se deck não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(null);

      await expect(cardService.list("999", 1)).rejects.toThrow(
        "Baralho não encontrado.",
      );
    });
  });

  describe("update", () => {
    it("deve atualizar um card", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.update).mockResolvedValue(mockCard);

      const result = await cardService.update("1", "1", 1, {
        front: "Nova Frente",
        back: "Novo Verso",
      });

      expect(result).toEqual(mockCard);
      expect(cardRepository.update).toHaveBeenCalledWith(
        "1",
        "1",
        "Nova Frente",
        "Novo Verso",
      );
    });

    it("deve lançar erro se deck não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(null);

      await expect(
        cardService.update("999", "1", 1, { front: "F", back: "B" }),
      ).rejects.toThrow("Baralho não encontrado.");
    });

    it("deve lançar erro se card não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.update).mockResolvedValue(null);

      await expect(
        cardService.update("1", "999", 1, { front: "F", back: "B" }),
      ).rejects.toThrow("Card não encontrado.");
    });
  });

  describe("delete", () => {
    it("deve deletar um card", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.delete).mockResolvedValue(mockCard);

      await cardService.delete("1", "1", 1);

      expect(cardRepository.delete).toHaveBeenCalledWith("1", "1");
    });

    it("deve lançar erro se deck não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(null);

      await expect(cardService.delete("999", "1", 1)).rejects.toThrow(
        "Baralho não encontrado.",
      );
    });

    it("deve lançar erro se card não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.delete).mockResolvedValue(null);

      await expect(cardService.delete("1", "999", 1)).rejects.toThrow(
        "Card não encontrado.",
      );
    });
  });
});
