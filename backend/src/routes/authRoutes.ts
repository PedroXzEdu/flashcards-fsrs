import { Router } from "express";

import { authController } from "../controllers/authController";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../schemas/authSchema";

const authRoutes = Router();

authRoutes.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register,
);

authRoutes.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login,
);

export default authRoutes;
