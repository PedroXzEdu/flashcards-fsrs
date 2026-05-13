import { analyticsRepository } from "../repositories/analyticsRepository";

class AnalyticsService {
  async getRetentionRate(userId: number) {
    return analyticsRepository.getRetentionRate(userId);
  }

  async getReviewHeatmap(userId: number) {
    return analyticsRepository.getReviewHeatmap(userId);
  }

  async getForgettingCurve(userId: number) {
    const result = await analyticsRepository.getAverageStability(userId);

    const stability = result.avg_stability || 1;

    const days = [0, 1, 3, 7, 14, 30, 60, 90];

    const curve = days.map((day) => {
      const retention = Math.exp(-day / stability) * 100;

      return {
        day,
        retention: Number(retention.toFixed(2)),
      };
    });

    return {
      stability,
      curve,
    };
  }

  async getPredictedRecall(userId: number) {
    const cards = await analyticsRepository.getCardsForRecall(userId);

    const now = new Date();

    const results = cards.map((card) => {
      const dueDate = new Date(card.due);

      const diffMs = now.getTime() - dueDate.getTime();

      const days = Math.max(diffMs / (1000 * 60 * 60 * 24), 0);

      const stability = card.stability || 1;

      const retention = Math.exp(-days / stability) * 100;

      return {
        card_id: card.id,
        front: card.front,
        predicted_recall: Number(retention.toFixed(2)),
      };
    });

    return results;
  }
}

export const analyticsService = new AnalyticsService();
