import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  createCard,
  getCards,
  updateCard,
  deleteCard,
} from "../controllers/cardController";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", createCard);
router.get("/", getCards);
router.put("/:card_id", updateCard);
router.delete("/:card_id", deleteCard);

export default router;
