import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token não fornecido.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret) as {
      id?: number;
      userId?: number;
    };

    const userId = payload.userId ?? payload.id;

    if (!userId) {
      return next(new AppError("Token inválido.", 401));
    }

    req.userId = userId;
    next();
  } catch {
    return next(new AppError("Token inválido.", 401));
  }
}
