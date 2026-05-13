import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  getReviewLogs,
  getDailyStats,
  getStreak,
  getActivity,
  getGlobalStats,
} from "../controllers/reviewLogsController";

const router = Router();

router.use(authMiddleware);

router.get("/", getReviewLogs);
router.get("/daily", getDailyStats);
router.get("/streak", getStreak);
router.get("/activity", getActivity);
router.get("/global-stats", getGlobalStats);

export default router;
