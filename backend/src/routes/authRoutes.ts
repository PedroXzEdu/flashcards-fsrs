import { Router } from "express";

import { authController } from "../controllers/authController";
import { authRateLimiter } from "../middlewares/rateLimiter";

const authRoutes = Router();

authRoutes.post("/register", authRateLimiter, authController.register);

authRoutes.post("/login", authRateLimiter, authController.login);

export default authRoutes;
