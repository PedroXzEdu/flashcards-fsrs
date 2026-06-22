import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { reviewSchema } from "../schemas/reviewSchema";

import {
  getDueCounts,
  getReviewCards,
  previewReview,
  submitReview,
} from "../controllers/reviewController";

const reviewRoutes = Router({ mergeParams: true });

reviewRoutes.use(authMiddleware);

// Executa revisão
reviewRoutes.get("/", getReviewCards);
reviewRoutes.get("/:cardId/preview", previewReview);
reviewRoutes.post("/:cardId", validate(reviewSchema), submitReview);

const dueCountsRouter = Router();
dueCountsRouter.use(authMiddleware);
dueCountsRouter.get("/", getDueCounts);

export { reviewRoutes, dueCountsRouter };
