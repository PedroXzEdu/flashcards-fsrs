import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createCardSchema, updateCardSchema } from "../schemas/cardSchema";
import {
  createCard,
  getCards,
  updateCard,
  deleteCard,
} from "../controllers/cardController";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", validate(createCardSchema), createCard);
router.get("/", getCards);
router.put("/:card_id", validate(updateCardSchema), updateCard);
router.delete("/:card_id", deleteCard);

export default router;
