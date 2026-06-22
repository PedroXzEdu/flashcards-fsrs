import { logger } from "../config/logger";
import { cardRepository } from "../repositories/cardRepository";

class PriorityQueueService {
  async getDailyQueue(userId: number, limit = 50) {
    logger.info({ userId }, "DailyQueue — consultando cards");

    const rows = await cardRepository.findDailyQueue(userId, limit);

    logger.info(
      { userId, rows: rows.length },
      "DailyQueue — resultados",
    );

    return rows;
  }
}

export const priorityQueueService = new PriorityQueueService();
