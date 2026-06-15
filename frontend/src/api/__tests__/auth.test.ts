import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../client", () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from "../client";
import { authApi } from "../auth";

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login deve chamar api.post com credenciais", async () => {
    const mockUser = { id: 1, name: "User", email: "user@test.com" };
    vi.mocked(api.post).mockResolvedValue({ user: mockUser, token: "abc" });

    const result = await authApi.login("user@test.com", "123");

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@test.com",
      password: "123",
    });
    expect(result).toEqual({ user: mockUser, token: "abc" });
  });

  it("register deve chamar api.post com dados do usuário", async () => {
    const mockUser = { id: 2, name: "New", email: "new@test.com" };
    vi.mocked(api.post).mockResolvedValue({ user: mockUser, token: "def" });

    const result = await authApi.register("New", "new@test.com", "456");

    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "New",
      email: "new@test.com",
      password: "456",
    });
    expect(result).toEqual({ user: mockUser, token: "def" });
  });
});
