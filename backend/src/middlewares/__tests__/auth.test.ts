import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { authMiddleware } from "../auth";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../config/env", () => ({
  env: {
    jwtSecret: "test-secret-key-12345",
  },
}));

function createReq(authHeader?: string) {
  return {
    headers: {
      authorization: authHeader,
    },
    requestId: "test-request-id",
  };
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 401 se token não for fornecido", () => {
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token não fornecido.",
      requestId: "test-request-id",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se header não começar com Bearer", () => {
    const req = createReq("TokenInvalido") as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token não fornecido.",
      requestId: "test-request-id",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se jwt.verify lançar erro", () => {
    (jwt.verify as any).mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    const req = createReq("Bearer token-invalido") as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token inválido.",
      requestId: "test-request-id",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se payload não contiver userId", () => {
    (jwt.verify as any).mockReturnValue({ sub: "abc" });

    const req = createReq("Bearer token-sem-user") as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token inválido.",
      requestId: "test-request-id",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next() e preencher req.userId com token válido", () => {
    (jwt.verify as any).mockReturnValue({ userId: 1 });

    const req = createReq("Bearer token-valido") as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("deve aceitar payload com campo id como fallback", () => {
    (jwt.verify as any).mockReturnValue({ id: 5 });

    const req = createReq("Bearer token-com-id") as any;
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe(5);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
