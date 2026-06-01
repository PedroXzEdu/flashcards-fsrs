import { describe, it, expect, vi, beforeEach } from "vitest";

import { importService } from "../importService";

import { deckRepository } from "../../repositories/deckRepository";
import { cardRepository } from "../../repositories/cardRepository";

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/cardRepository", () => ({
  cardRepository: {
    create: vi.fn(),
  },
}));

const mockDeck = {
  id: 1,
  title: "Importado do Anki",
  user_id: 1,
};

describe("ImportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeckFromAnki", () => {
    it("deve importar notas com sucesso", async () => {
      vi.mocked(deckRepository.create).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.create).mockResolvedValue({ id: 1 });

      const notes = [
        { front: "Pergunta 1", back: "Resposta 1" },
        { front: "Pergunta 2", back: "Resposta 2" },
      ];

      const result = await importService.createDeckFromAnki(
        1,
        "Meu Deck",
        notes,
      );

      expect(result.deck).toEqual(mockDeck);
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(cardRepository.create).toHaveBeenCalledTimes(2);
      expect(cardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deck_id: 1,
          front: "Pergunta 1",
          back: "Resposta 1",
          stability: expect.any(Number),
          difficulty: expect.any(Number),
          state: expect.any(Number),
        }),
      );
    });

    it("deve pular notas com front ou back vazios", async () => {
      vi.mocked(deckRepository.create).mockResolvedValue(mockDeck);
      vi.mocked(cardRepository.create).mockResolvedValue({ id: 1 });

      const notes = [
        { front: "Válida", back: "Resposta" },
        { front: "", back: "Sem front" },
        { front: "Sem back", back: "" },
        { front: "", back: "" },
      ];

      const result = await importService.createDeckFromAnki(
        1,
        "Meu Deck",
        notes,
      );

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(3);
      expect(cardRepository.create).toHaveBeenCalledTimes(1);
    });

    it("deve importar lista vazia de notas", async () => {
      vi.mocked(deckRepository.create).mockResolvedValue(mockDeck);

      const result = await importService.createDeckFromAnki(1, "Meu Deck", []);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(0);
      expect(cardRepository.create).not.toHaveBeenCalled();
    });

    it("deve propagar erro se criação do deck falhar", async () => {
      vi.mocked(deckRepository.create).mockRejectedValue(new Error("DB error"));

      await expect(
        importService.createDeckFromAnki(1, "Meu Deck", [
          { front: "F", back: "B" },
        ]),
      ).rejects.toThrow("DB error");

      expect(cardRepository.create).not.toHaveBeenCalled();
    });
  });
});
