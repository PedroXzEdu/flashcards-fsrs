import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createCardRateLimiter } from "../middlewares/rateLimiter";
import {
  createCardSchema,
  updateCardSchema,
  createCardsBatchSchema,
} from "../schemas/cardSchema";
import { paginationSchema } from "../schemas/querySchemas";
import {
  createCard,
  createCardsBatch,
  getCards,
  updateCard,
  deleteCard,
} from "../controllers/cardController";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post(
  "/batch",
  createCardRateLimiter,
  validate(createCardsBatchSchema),
  createCardsBatch,
);
router.post("/", createCardRateLimiter, validate(createCardSchema), createCard);
router.get("/", validate(undefined, paginationSchema), getCards);
router.put("/:card_id", validate(updateCardSchema), updateCard);
router.delete("/:card_id", deleteCard);

export default router;
