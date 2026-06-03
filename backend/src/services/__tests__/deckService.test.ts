import { describe, it, expect, vi, beforeEach } from "vitest";

import { deckService } from "../deckService";

import { deckRepository } from "../../repositories/deckRepository";

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    create: vi.fn(),
    findByUser: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    getCardStats: vi.fn(),
    getReviewStats: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

const mockDeck = {
  id: 1,
  title: "Meu Deck",
  description: "Descrição",
  is_public: false,
  user_id: 1,
};

describe("DeckService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um deck", async () => {
      vi.mocked(deckRepository.create).mockResolvedValue(mockDeck);

      const result = await deckService.create({
        userId: 1,
        title: "Meu Deck",
      });

      expect(result).toEqual(mockDeck);
    });

    it("deve lançar erro sem título", async () => {
      await expect(
        deckService.create({
          userId: 1,
        }),
      ).rejects.toThrow("O título é obrigatório.");
    });
  });

  describe("list", () => {
    it("deve listar decks do usuário", async () => {
      vi.mocked(deckRepository.findByUser).mockResolvedValue([mockDeck]);

      const result = await deckService.list(1);

      expect(result).toEqual([mockDeck]);
      expect(deckRepository.findByUser).toHaveBeenCalledWith(1);
    });
  });

  describe("get", () => {
    it("deve retornar um deck por id", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(mockDeck);

      const result = await deckService.get("1", 1);

      expect(result).toEqual(mockDeck);
    });

    it("deve lançar erro se deck não existe", async () => {
      vi.mocked(deckRepository.findById).mockResolvedValue(null);

      await expect(deckService.get("999", 1)).rejects.toThrow(
        "Baralho não encontrado.",
      );
    });
  });

  describe("update", () => {
    it("deve atualizar um deck", async () => {
      vi.mocked(deckRepository.update).mockResolvedValue(mockDeck);

      const result = await deckService.update("1", 1, {
        title: "Meu Deck",
        description: "Nova descrição",
      });

      expect(result).toEqual(mockDeck);
      expect(deckRepository.update).toHaveBeenCalled();
    });

    it("deve lançar erro se deck não existe na atualização", async () => {
      vi.mocked(deckRepository.update).mockResolvedValue(null);

      await expect(
        deckService.update("999", 1, { title: "Novo" }),
      ).rejects.toThrow("Baralho não encontrado.");
    });
  });

  describe("delete", () => {
    it("deve deletar um deck", async () => {
      vi.mocked(deckRepository.delete).mockResolvedValue(true);

      await deckService.delete("1", 1);

      expect(deckRepository.delete).toHaveBeenCalledWith("1", 1);
    });

    it("deve lançar erro se deck não existe na exclusão", async () => {
      vi.mocked(deckRepository.delete).mockResolvedValue(null);

      await expect(deckService.delete("999", 1)).rejects.toThrow(
        "Baralho não encontrado.",
      );
    });
  });

  describe("updateSettings", () => {
    it("deve atualizar configurações", async () => {
      vi.mocked(deckRepository.updateSettings).mockResolvedValue(mockDeck);

      const result = await deckService.updateSettings("1", 1, {
        new_cards_per_day: 10,
      });

      expect(result).toEqual(mockDeck);
    });

    it("deve lançar erro se deck não existe nas configurações", async () => {
      vi.mocked(deckRepository.updateSettings).mockResolvedValue(null);

      await expect(
        deckService.updateSettings("999", 1, {
          new_cards_per_day: 10,
        }),
      ).rejects.toThrow("Baralho não encontrado.");
    });
  });
});
