import { describe, it, expect, vi } from "vitest";

import { deckService } from "../deckService";

import { deckRepository } from "../../repositories/deckRepository";

vi.mock("../../repositories/deckRepository", () => ({
  deckRepository: {
    create: vi.fn(),
  },
}));

describe("DeckService", () => {
  it("deve criar um deck", async () => {
    vi.mocked(deckRepository.create).mockResolvedValue({
      id: 1,
      title: "Meu Deck",
    });

    const result = await deckService.create({
      userId: 1,
      title: "Meu Deck",
    });

    expect(result).toEqual({
      id: 1,
      title: "Meu Deck",
    });
  });

  it("deve lançar erro sem título", async () => {
    await expect(
      deckService.create({
        userId: 1,
      }),
    ).rejects.toThrow("O título é obrigatório.");
  });
});
