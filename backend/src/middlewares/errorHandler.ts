import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

import { AppError } from "../utils/AppError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  // AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Erro de validação.",
      details: err.flatten(),
    });
  }

  // Multer: invalid file type
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      error: "Invalid file type",
    });
  }

  // Multer: file too large
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "File too large",
    });
  }

  // Payload too large
  if (err.type === "entity.too.large" || err.code === "ENTITY_TOO_LARGE" || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: "Payload muito grande.",
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: "Erro interno do servidor.",
  });
}
