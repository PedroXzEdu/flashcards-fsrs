import { Router } from "express";

import authRoutes from "./authRoutes";
import deckRoutes from "./deckRoutes";
import cardRoutes from "./cardRoutes";
import { reviewRoutes, dueCountsRouter } from "./reviewRoutes";
import reviewLogsRoutes from "./reviewLogsRoutes";
import importRoutes from "./importRoutes";
import metricsRoutes from "./metricsRoutes";
import achievementRoutes from "./achievementRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/decks", deckRoutes);
routes.use("/import", importRoutes);
routes.use("/review-logs", reviewLogsRoutes);
routes.use("/metrics", metricsRoutes);
routes.use("/achievements", achievementRoutes);

routes.use("/decks/:deck_id/cards", cardRoutes);
routes.use("/decks/:deck_id/review", reviewRoutes);
routes.use("/decks/review/due-counts", dueCountsRouter);

export { routes };
