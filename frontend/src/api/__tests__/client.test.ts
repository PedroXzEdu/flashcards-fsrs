import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../client";

const mockFetchResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
  headers: new Headers(),
  statusText: ok ? "OK" : "Error",
  redirected: false,
  type: "basic" as const,
  url: "",
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: vi.fn(),
  blob: vi.fn(),
  formData: vi.fn(),
  text: vi.fn(),
  bytes: vi.fn(),
});

describe("api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("api.get deve fazer GET request", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ data: { items: [1, 2] } }),
    );
    const result = await api.get("/test");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual({ items: [1, 2] });
  });

  it("api.post deve fazer POST com body JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ data: { id: 1 } }),
    );
    const result = await api.post("/test", { name: "foo" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "foo" }),
      }),
    );
    expect(result).toEqual({ id: 1 });
  });

  it("api.put deve fazer PUT com body JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ data: { updated: true } }),
    );
    const result = await api.put("/test/1", { name: "bar" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/test/1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(result).toEqual({ updated: true });
  });

  it("api.delete deve fazer DELETE", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ data: null }));
    const result = await api.delete("/test/1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/test/1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result).toBeNull();
  });

  it("api.patch deve fazer PATCH com body JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ data: { patched: true } }),
    );
    const result = await api.patch("/test/1", { field: "value" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/test/1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(result).toEqual({ patched: true });
  });

  it("deve incluir token de autenticação no header", async () => {
    localStorage.setItem("token", "my-token");
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse({ data: {} }));
    await api.get("/secure");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/secure",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      }),
    );
  });

  it("deve lançar erro quando resposta não é ok", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse({ error: "Not found" }, false, 404),
    );
    await expect(api.get("/not-found")).rejects.toThrow("Not found");
  });

  it("deve lançar erro de rede quando fetch falha", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api.get("/fail")).rejects.toThrow(
      "Sem conexão com o servidor",
    );
  });

  it("deve retornar null para status 204", async () => {
    const res = mockFetchResponse({}, true, 204);
    res.json = vi.fn().mockRejectedValue(new Error("no content"));
    vi.mocked(fetch).mockResolvedValue(res);
    const result = await api.delete("/no-content");
    expect(result).toBeNull();
  });
});
