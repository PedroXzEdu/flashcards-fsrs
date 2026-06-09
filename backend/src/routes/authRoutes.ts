import { Router } from "express";

import { authController } from "../controllers/authController";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { bruteForceProtection } from "../middlewares/bruteForce";
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
  bruteForceProtection(),
  validate(loginSchema),
  authController.login,
);

export default authRoutes;
