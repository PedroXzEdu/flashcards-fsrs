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
import { decksApi, importApi } from "../decks";

const mockResponse = (data: unknown, ok = true) => ({
  ok,
  json: vi.fn().mockResolvedValue({ data }),
  headers: new Headers(),
  status: ok ? 200 : 400,
  statusText: ok ? "OK" : "Error",
} as unknown as Response);

describe("decksApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list deve chamar api.get", () => {
    decksApi.list();
    expect(api.get).toHaveBeenCalledWith("/decks");
  });

  it("get deve chamar api.get com id", () => {
    decksApi.get(1);
    expect(api.get).toHaveBeenCalledWith("/decks/1");
  });

  it("create deve chamar api.post com título e descrição", () => {
    decksApi.create("Meu Deck", "Descrição", false);
    expect(api.post).toHaveBeenCalledWith("/decks", {
      title: "Meu Deck",
      description: "Descrição",
      is_public: false,
    });
  });

  it("update deve chamar api.put", () => {
    decksApi.update(1, "Novo Título", "Nova descrição", true);
    expect(api.put).toHaveBeenCalledWith("/decks/1", {
      title: "Novo Título",
      description: "Nova descrição",
      is_public: true,
    });
  });

  it("delete deve chamar api.delete", () => {
    decksApi.delete(1);
    expect(api.delete).toHaveBeenCalledWith("/decks/1");
  });

  it("stats deve chamar api.get", () => {
    decksApi.stats(1);
    expect(api.get).toHaveBeenCalledWith("/decks/1/stats");
  });

  it("updateSettings deve chamar api.put com new_cards_per_day", () => {
    decksApi.updateSettings(1, { new_cards_per_day: 15 });
    expect(api.put).toHaveBeenCalledWith("/decks/1/settings", {
      new_cards_per_day: 15,
    });
  });

  it("share deve chamar api.post", () => {
    decksApi.share(1);
    expect(api.post).toHaveBeenCalledWith("/decks/1/share", {});
  });

  it("unshare deve chamar api.delete", () => {
    decksApi.unshare(1);
    expect(api.delete).toHaveBeenCalledWith("/decks/1/share");
  });

  it("getSharedPreview deve chamar api.get com token", () => {
    decksApi.getSharedPreview("token-abc");
    expect(api.get).toHaveBeenCalledWith("/decks/shared/token-abc/preview");
  });

  it("importShared deve chamar api.post com token", () => {
    decksApi.importShared("token-abc");
    expect(api.post).toHaveBeenCalledWith("/decks/shared/token-abc/import", {});
  });
});

describe("importApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("importApkg deve fazer POST com FormData", async () => {
    localStorage.setItem("token", "token-123");
    vi.mocked(fetch).mockResolvedValue(mockResponse({ imported: 5 }));

    const file = new File(["data"], "deck.apkg", { type: "application/octet-stream" });
    const result = await importApi.importApkg(file);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/import"),
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer token-123" },
      }),
    );
    expect(result).toEqual({ imported: 5 });
  });

  it("importApkg deve lançar erro quando resposta não é ok", async () => {
    localStorage.setItem("token", "token-123");
    const errRes = {
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Invalid file" }),
      headers: new Headers(),
      status: 400,
      statusText: "Error",
    } as unknown as Response;
    vi.mocked(fetch).mockResolvedValue(errRes);

    const file = new File(["bad"], "deck.apkg", { type: "application/octet-stream" });
    await expect(importApi.importApkg(file)).rejects.toThrow("Invalid file");
  });
});
