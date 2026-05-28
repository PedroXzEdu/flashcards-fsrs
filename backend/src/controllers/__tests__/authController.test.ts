import { describe, it, expect, vi, beforeEach } from "vitest";
import { authController } from "../authController";
import { authService } from "../../services/authService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/authService", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
  },
}));

const mockResult = {
  user: { id: 1, name: "Teste", email: "teste@email.com" },
  token: "jwt-token",
};

function createReq(body: Record<string, unknown> = {}) {
  return { body } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("deve registrar e retornar 201 com success/data", async () => {
      vi.mocked(authService.register).mockResolvedValue(mockResult);

      const req = createReq({
        name: "Teste",
        email: "teste@email.com",
        password: "senha123",
      });
      const res = createRes();
      const next = vi.fn();

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(
        "Teste",
        "teste@email.com",
        "senha123",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se authService.register lançar erro", async () => {
      const error = new AppError("Email já cadastrado.", 400);
      vi.mocked(authService.register).mockRejectedValue(error);

      const req = createReq({
        name: "Teste",
        email: "existente@email.com",
        password: "senha123",
      });
      const res = createRes();
      const next = vi.fn();

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("deve logar e retornar 200 com success/data", async () => {
      vi.mocked(authService.login).mockResolvedValue(mockResult);

      const req = createReq({
        email: "teste@email.com",
        password: "senha123",
      });
      const res = createRes();
      const next = vi.fn();

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(
        "teste@email.com",
        "senha123",
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se authService.login lançar erro", async () => {
      const error = new AppError("Senha inválida.", 401);
      vi.mocked(authService.login).mockRejectedValue(error);

      const req = createReq({
        email: "teste@email.com",
        password: "senha_errada",
      });
      const res = createRes();
      const next = vi.fn();

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
