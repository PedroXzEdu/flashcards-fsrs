import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

import { authService } from "../authService";

import { userRepository } from "../../repositories/userRepository";

vi.mock("../../repositories/userRepository", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  name: "Teste",
  email: "teste@email.com",
  password: "hashed_password",
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("deve registrar um novo usuário", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
        "hashed_password",
      );
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);

      const result = await authService.register(
        "Teste",
        "teste@email.com",
        "senha123",
      );

      expect(result.user).toEqual({
        id: 1,
        name: "Teste",
        email: "teste@email.com",
      });
      expect(result.token).toBeTruthy();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "teste@email.com",
      );
      expect(userRepository.create).toHaveBeenCalled();
    });

    it("deve lançar erro se email já existe", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.register("Teste", "teste@email.com", "senha123"),
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("login", () => {
    it("deve autenticar com credenciais válidas", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(
        bcrypt.compare as ReturnType<typeof vi.fn>,
      ).mockResolvedValue(true);

      const result = await authService.login("teste@email.com", "senha123");

      expect(result.user).toEqual({
        id: 1,
        name: "Teste",
        email: "teste@email.com",
      });
      expect(result.token).toBeTruthy();
    });

    it("deve lançar erro com senha inválida", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(
        bcrypt.compare as ReturnType<typeof vi.fn>,
      ).mockResolvedValue(false);

      await expect(
        authService.login("teste@email.com", "senha_errada"),
      ).rejects.toThrow("Invalid password");
    });

    it("deve lançar erro se usuário não existe", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authService.login("nao_existe@email.com", "senha123"),
      ).rejects.toThrow("User not found");
    });
  });
});
