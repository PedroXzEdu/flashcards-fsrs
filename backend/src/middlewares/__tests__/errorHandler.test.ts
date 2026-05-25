import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZodError } from "zod";

import { errorHandler } from "../errorHandler";
import { AppError } from "../../utils/AppError";

vi.mock("../../config/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

function createReq() {
  return {
    requestId: "test-request-id",
  };
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve responder com status e mensagem do AppError", () => {
    const err = new AppError("Recurso não encontrado.", 404);
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Recurso não encontrado.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 400 para AppError sem statusCode explícito", () => {
    const err = new AppError("Erro de validação.");
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro de validação.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 400 com details.flatten() para ZodError", () => {
    const zodError = new ZodError([
      {
        code: "custom",
        path: ["email"],
        message: "Email inválido",
      },
    ]);
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro de validação.",
      details: zodError.flatten(),
      requestId: "test-request-id",
    });
  });

  it("deve responder 400 para erro Multer INVALID_FILE_TYPE", () => {
    const err: any = new Error("Invalid file");
    err.code = "INVALID_FILE_TYPE";
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Tipo de arquivo inválido.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 413 para erro Multer LIMIT_FILE_SIZE", () => {
    const err: any = new Error("File too large");
    err.code = "LIMIT_FILE_SIZE";
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Arquivo muito grande.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 413 para entity.too.large", () => {
    const err: any = new Error("Entity too large");
    err.type = "entity.too.large";
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Payload muito grande.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 413 para ENTITY_TOO_LARGE", () => {
    const err: any = new Error("Entity too large");
    err.code = "ENTITY_TOO_LARGE";
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Payload muito grande.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 413 para err.status === 413", () => {
    const err: any = new Error("Payload too large");
    err.status = 413;
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Payload muito grande.",
      requestId: "test-request-id",
    });
  });

  it("deve responder 500 para erro genérico inesperado", () => {
    const err = new Error("Algo quebrou");
    const req = createReq() as any;
    const res = createRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro interno do servidor.",
      requestId: "test-request-id",
    });
  });
});
