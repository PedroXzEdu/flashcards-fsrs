import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";

import {
  getRetentionRate,
  getReviewHeatmap,
  getForgettingCurve,
  getPredictedRecall,
  getDailyQueue,
} from "../controllers/analyticsController";

const router = Router();

router.use(authMiddleware);

router.get("/retention-rate", getRetentionRate);

router.get("/review-heatmap", getReviewHeatmap);

router.get("/forgetting-curve", getForgettingCurve);

router.get("/predicted-recall", getPredictedRecall);

router.get("/daily-queue", getDailyQueue);

export default router;
