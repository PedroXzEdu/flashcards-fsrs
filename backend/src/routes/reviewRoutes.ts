import { Router } from "express";

import { authMiddleware } from "../middlewares/auth";

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
router.post("/:cardId", submitReview);

export default router;
