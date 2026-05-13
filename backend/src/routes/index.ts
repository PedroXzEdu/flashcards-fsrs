import { Router } from "express";

import authRoutes from "./authRoutes";
import deckRoutes from "./deckRoutes";
import cardRoutes from "./cardRoutes";
import reviewRoutes from "./reviewRoutes";
import reviewLogsRoutes from "./reviewLogsRoutes";
import importRoutes from "./importRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/decks", deckRoutes);
routes.use("/import", importRoutes);
routes.use("/review-logs", reviewLogsRoutes);

routes.use("/decks/:deck_id/cards", cardRoutes);
routes.use("/decks/:deck_id/review", reviewRoutes);

export { routes };
