import { logger } from "../config/logger";
import { cardRepository } from "../repositories/cardRepository";

class PriorityQueueService {
  /**
   * Retorna cards ordenados por risco de esquecimento.
   * Quanto menor a retenção prevista, maior prioridade.
   */
  async getDailyQueue(userId: number, limit = 50) {
    logger.info({ userId }, "DailyQueue — consultando cards");

    const rows = await cardRepository.findDailyQueue(userId, limit);

    logger.info(
      { userId, rows: rows.length, firstFew: rows.slice(0, 3) },
      "DailyQueue — resultados",
    );

    // Calcula predicted recall para cada card
    const now = new Date();
    const cards = rows.map((card) => {
      const dueDate = new Date(card.due);
      const days = Math.max(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        0,
      );

      const retention = Math.exp(-days / (card.stability || 1)) * 100;

      return {
        ...card,
        predicted_recall: Number(retention.toFixed(2)),
      };
    });

    // Ordena pelo risco (menor recall primeiro)
    return cards.sort((a, b) => a.predicted_recall - b.predicted_recall);
  }
}

export const priorityQueueService = new PriorityQueueService();
