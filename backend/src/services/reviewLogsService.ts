import { reviewLogRepository } from "../repositories/reviewLogRepository";

class ReviewLogsService {
  async getRecent(userId: number) {
    const logs = await reviewLogRepository.findRecent(userId);

    return {
      logs,
      total: logs.length,
    };
  }

  async getDailyStats(userId: number) {
    const dailyStats = await reviewLogRepository.getDailyStats(userId);

    return { daily_stats: dailyStats };
  }

  async getStreak(userId: number) {
    const days = await reviewLogRepository.getReviewDays(userId);

    if (days.length === 0) {
      return { streak: 0, longest: 0, total_days: 0, last_review: null };
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    if (days[0] !== today && days[0] !== yesterday) {
      return {
        streak: 0,
        longest: 0,
        total_days: days.length,
        last_review: days[0],
      };
    }

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    let longest = 1;
    let current = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }

    return {
      streak,
      longest,
      total_days: days.length,
      last_review: days[0],
    };
  }

  async getActivity(userId: number) {
    const activity = await reviewLogRepository.getActivity(userId);

    return { activity };
  }

  async getGlobalStats(userId: number) {
    return reviewLogRepository.getGlobalStats(userId);
  }
}

export const reviewLogsService = new ReviewLogsService();
