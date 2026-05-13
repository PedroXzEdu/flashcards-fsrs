import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createDeckSchema } from "../schemas/deckSchema";
import {
  createDeck,
  getDecks,
  getDeck,
  updateDeck,
  deleteDeck,
  getDeckStats,
  updateDeckSettings,
  shareDeck,
  unshareDeck,
  importSharedDeck,
  getSharedDeckPreview,
} from "../controllers/deckController";

const router = Router();

router.get("/shared/:token/preview", getSharedDeckPreview);

router.use(authMiddleware);

router.post("/", validate(createDeckSchema), createDeck);
router.get("/", getDecks);
router.post("/shared/:token/import", importSharedDeck);
router.get("/:id", getDeck);
router.get("/:id/stats", getDeckStats);
router.put("/:id", updateDeck);
router.put("/:id/settings", updateDeckSettings);
router.patch("/:id/settings", updateDeckSettings);
router.delete("/:id", deleteDeck);
router.post("/:id/share", shareDeck);
router.delete("/:id/share", unshareDeck);

export default router;
