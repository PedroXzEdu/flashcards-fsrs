import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createDeckRateLimiter } from "../middlewares/rateLimiter";
import {
  createDeckSchema,
  updateDeckSchema,
  settingsSchema,
} from "../schemas/deckSchema";
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

router.post("/", createDeckRateLimiter, validate(createDeckSchema), createDeck);
router.get("/", getDecks);
router.post("/shared/:token/import", importSharedDeck);
router.get("/:id", getDeck);
router.get("/:id/stats", getDeckStats);
router.put("/:id", validate(updateDeckSchema), updateDeck);
router.put("/:id/settings", validate(settingsSchema), updateDeckSettings);
router.patch("/:id/settings", validate(settingsSchema), updateDeckSettings);
router.delete("/:id", deleteDeck);
router.post("/:id/share", shareDeck);
router.delete("/:id/share", unshareDeck);

export default router;
