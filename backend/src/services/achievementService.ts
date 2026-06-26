import { achievementRepository } from "../repositories/achievementRepository";
import { cardRepository } from "../repositories/cardRepository";
import { reviewLogRepository } from "../repositories/reviewLogRepository";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_review", title: "Primeira Revisão", description: "Complete sua primeira revisão." },
  { key: "streak_7", title: "Dedicação Inicial", description: "Mantenha 7 dias de sequência." },
  { key: "streak_30", title: "Mestre da Consistência", description: "Mantenha 30 dias de sequência." },
  { key: "reviews_100", title: "Centenário", description: "Complete 100 revisões." },
  { key: "reviews_1000", title: "Maratonista", description: "Complete 1.000 revisões." },
  { key: "cards_25", title: "Colecionador", description: "Crie 25 cards." },
  { key: "cards_100", title: "Biblioteca", description: "Crie 100 cards." },
];

class AchievementService {
  async getUserAchievements(userId: number): Promise<AchievementDef[]> {
    const rows = await achievementRepository.findByUser(userId);
    return rows.map((r) => {
      const def = ACHIEVEMENTS.find((a) => a.key === r.key);
      return def ?? { key: r.key, title: r.key, description: "" };
    });
  }

  async checkAndUnlock(userId: number): Promise<AchievementDef[]> {
    const unlocked = await achievementRepository.findByUser(userId);
    const unlockedKeys = new Set(unlocked.map((r) => r.key));

    const newAchievements: AchievementDef[] = [];

    const { days } = await reviewLogRepository.getReviewDays(userId);
    const streak = this.computeStreak(days);

    const counts = await this.getUserCounts(userId);

    const checks: { key: string; condition: boolean }[] = [
      { key: "first_review", condition: counts.totalReviews >= 1 },
      { key: "streak_7", condition: streak >= 7 },
      { key: "streak_30", condition: streak >= 30 },
      { key: "reviews_100", condition: counts.totalReviews >= 100 },
      { key: "reviews_1000", condition: counts.totalReviews >= 1000 },
      { key: "cards_25", condition: counts.totalCards >= 25 },
      { key: "cards_100", condition: counts.totalCards >= 100 },
    ];

    for (const check of checks) {
      if (check.condition && !unlockedKeys.has(check.key)) {
        await achievementRepository.create(userId, check.key);
        const def = ACHIEVEMENTS.find((a) => a.key === check.key);
        if (def) newAchievements.push(def);
      }
    }

    return newAchievements;
  }

  private computeStreak(days: string[]): number {
    if (days.length === 0) return 0;

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (days[0] !== today && days[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }

    return streak;
  }

  private async getUserCounts(userId: number): Promise<{ totalReviews: number; totalCards: number }> {
    const stats = await reviewLogRepository.getGlobalStats(userId);
    const totalReviews = Number(stats.reviews.total_reviews);

    const cardsResult = await cardRepository.getCardCountByUser(userId);

    return { totalReviews, totalCards: cardsResult };
  }
}

export const achievementService = new AchievementService();
