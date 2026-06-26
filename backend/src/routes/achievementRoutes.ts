import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { getAchievements } from "../controllers/achievementController";

const router = Router();

router.use(authMiddleware);

router.get("/", getAchievements);

export default router;
