import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";

function isErrorLike(err: unknown): err is { code?: unknown; type?: unknown; status?: unknown } {
  return typeof err === "object" && err !== null;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(
    { err, requestId: req.requestId },
    err instanceof Error ? err.message : "Unhandled error",
  );

  const requestId = req.requestId;

  // AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      requestId,
    });
  }

  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Erro de validação.",
      details: err.flatten(),
      requestId,
    });
  }

  if (isErrorLike(err)) {
    // Multer: invalid file type
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        success: false,
        error: "Tipo de arquivo inválido.",
        requestId,
      });
    }

    // Multer: file too large
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "Arquivo muito grande.",
        requestId,
      });
    }

    // Payload too large
    if (
      err.type === "entity.too.large" ||
      err.code === "ENTITY_TOO_LARGE" ||
      err.status === 413
    ) {
      return res.status(413).json({
        success: false,
        error: "Payload muito grande.",
        requestId,
      });
    }
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: "Erro interno do servidor.",
    requestId,
  });
}
