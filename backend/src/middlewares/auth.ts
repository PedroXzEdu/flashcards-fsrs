import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    res.status(401).json({ error: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id?: number;
      userId?: number;
    };

    const userId = payload.userId ?? payload.id;

    if (!userId) {
      res.status(401).json({ error: "Token invÃ¡lido." });
      return;
    }

    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido." });
  }
}
