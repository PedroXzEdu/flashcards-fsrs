import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { reviewSchema } from "../schemas/reviewSchema";

import {
  getReviewCards,
  previewReview,
  submitReview,
} from "../controllers/reviewController";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// Executa revisão
router.get("/", getReviewCards);
router.get("/:cardId/preview", previewReview);
router.post("/:cardId", validate(reviewSchema), submitReview);

export default router;
