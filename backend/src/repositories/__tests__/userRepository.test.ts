import { describe, it, expect, vi, beforeEach } from "vitest";
import { userRepository } from "../userRepository";
import { pool } from "../../database/db";

vi.mock("../../database/db", () => ({
  pool: {
    query: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  name: "Teste",
  email: "teste@teste.com",
  password: "hash123",
};

describe("UserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("deve retornar usuário quando email existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockUser] });

      const result = await userRepository.findByEmail("teste@teste.com");

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM users WHERE email = $1"),
        ["teste@teste.com"],
      );
    });

    it("deve retornar undefined quando email não existe", async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await userRepository.findByEmail("naoexiste@teste.com");

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("deve criar usuário com dados válidos", async () => {
      (pool.query as any).mockResolvedValue({ rows: [mockUser] });

      const result = await userRepository.create(
        "Teste",
        "teste@teste.com",
        "hash123",
      );

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        ["Teste", "teste@teste.com", "hash123"],
      );
    });

    it("deve rejeitar email duplicado", async () => {
      (pool.query as any).mockRejectedValue(
        new Error("duplicate key value violates unique constraint"),
      );

      await expect(
        userRepository.create("Teste", "duplicado@teste.com", "hash456"),
      ).rejects.toThrow("duplicate key");
    });
  });
});
