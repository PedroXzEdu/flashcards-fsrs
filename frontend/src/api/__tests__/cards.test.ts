import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "../client";
import { cardsApi } from "../cards";

describe("cardsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list deve chamar api.get com paginação", () => {
    cardsApi.list(1, 2, 10);
    expect(api.get).toHaveBeenCalledWith("/decks/1/cards?page=2&limit=10");
  });

  it("create deve chamar api.post com front e back", () => {
    cardsApi.create(1, "Frente", "Verso");
    expect(api.post).toHaveBeenCalledWith("/decks/1/cards", {
      front: "Frente",
      back: "Verso",
    });
  });

  it("createBatch deve chamar api.post com array de cards", () => {
    const cards = [{ front: "A", back: "B" }];
    cardsApi.createBatch(1, cards);
    expect(api.post).toHaveBeenCalledWith("/decks/1/cards/batch", { cards });
  });

  it("update deve chamar api.put com front e back", () => {
    cardsApi.update(1, 5, "Nova frente", "Novo verso");
    expect(api.put).toHaveBeenCalledWith("/decks/1/cards/5", {
      front: "Nova frente",
      back: "Novo verso",
    });
  });

  it("delete deve chamar api.delete", () => {
    cardsApi.delete(1, 5);
    expect(api.delete).toHaveBeenCalledWith("/decks/1/cards/5");
  });

  it("forReview deve chamar api.get", () => {
    cardsApi.forReview(1);
    expect(api.get).toHaveBeenCalledWith("/decks/1/review");
  });

  it("preview deve chamar api.get", () => {
    cardsApi.preview(1, 5);
    expect(api.get).toHaveBeenCalledWith("/decks/1/review/5/preview");
  });

  it("review deve chamar api.post com rating", () => {
    cardsApi.review(1, 5, 3);
    expect(api.post).toHaveBeenCalledWith("/decks/1/review/5", { rating: 3 });
  });
});
