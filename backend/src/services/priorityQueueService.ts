import { pool } from "../database/db";

class PriorityQueueService {
  /**
   * Retorna cards ordenados por risco de esquecimento.
   * Quanto menor a retenção prevista, maior prioridade.
   */
  async getDailyQueue(userId: number, limit = 50) {
    const result = await pool.query(
      `SELECT c.id, c.front, c.back, c.stability, c.due
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE d.user_id = $1
       ORDER BY (EXTRACT(EPOCH FROM NOW() - c.due) / NULLIF(c.stability,1)) DESC
       LIMIT $2`,
      [userId, limit],
    );

    // Calcula predicted recall para cada card
    const now = new Date();
    const cards = result.rows.map((card) => {
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
