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

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: "Erro interno do servidor.",
  });
}
