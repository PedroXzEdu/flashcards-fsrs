import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  analyticsMonthsSchema,
  analyticsDaysSchema,
} from "../schemas/querySchemas";

import {
  getRetentionRate,
  getReviewHeatmap,
  getForgettingCurve,
  getPredictedRecall,
  getWorkloadForecast,
  getDailyQueue,
} from "../controllers/analyticsController";

const router = Router();

router.use(authMiddleware);

router.get("/retention-rate", validate(undefined, analyticsMonthsSchema), getRetentionRate);

router.get("/review-heatmap", validate(undefined, analyticsMonthsSchema), getReviewHeatmap);

router.get("/forgetting-curve", getForgettingCurve);

router.get("/predicted-recall", getPredictedRecall);

router.get("/workload-forecast", validate(undefined, analyticsDaysSchema), getWorkloadForecast);

router.get("/daily-queue", getDailyQueue);

export default router;
