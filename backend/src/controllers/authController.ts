import { Request, Response, NextFunction } from "express";

import { authService } from "../services/authService";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(
        req.body.name,
        req.body.email,
        req.body.password,
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);

      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
