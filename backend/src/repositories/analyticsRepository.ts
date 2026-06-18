import { pool } from "../database/db";
import { logger } from "../config/logger";

interface RetentionRateRow {
  total_reviews: number;
  successful_reviews: number;
  retention_rate: number;
}

interface HeatmapRow {
  day: string;
  reviews: number;
}

interface AvgStabilityRow {
  avg_stability: number;
}

interface WorkloadRow {
  day: string;
  review_cards: number;
  new_cards: number;
}

interface RecallCardRow {
  id: number;
  front: string;
  stability: number;
  due: Date;
}

class AnalyticsRepository {
  async getRetentionRate(userId: number, months = 12): Promise<RetentionRateRow> {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_reviews,

        COUNT(*) FILTER (
          WHERE rating >= 2
        ) AS successful_reviews,

        ROUND(
          COUNT(*) FILTER (
            WHERE rating >= 2
          )::numeric
          / NULLIF(COUNT(*), 0)
          * 100,
          2
        ) AS retention_rate

       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '1 month' * $2`,
      [userId, months],
    );

    return result.rows[0];
  }

  async getReviewHeatmap(userId: number, months = 12): Promise<HeatmapRow[]> {
    const result = await pool.query(
      `SELECT
        DATE(review) AS day,
        COUNT(*)::int AS reviews
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '1 month' * $2
       GROUP BY day
       ORDER BY day`,
      [userId, months],
    );

    return result.rows;
  }

  async getAverageStability(userId: number): Promise<AvgStabilityRow> {
    const result = await pool.query(
      `SELECT
        AVG(stability)::float AS avg_stability
       FROM cards c
       JOIN decks d
         ON d.id = c.deck_id
       WHERE d.user_id = $1`,
      [userId],
    );

    return result.rows[0];
  }

  async getWorkloadForecast(userId: number, days: number): Promise<WorkloadRow[]> {
    const result = await pool.query(
      `SELECT
        GREATEST(DATE(c.due), CURRENT_DATE)::text AS day,
        COUNT(*) FILTER (WHERE c.state != 0)::int AS review_cards,
        COUNT(*) FILTER (WHERE c.state = 0)::int  AS new_cards
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE d.user_id = $1
         AND c.due < CURRENT_DATE + INTERVAL '1 day' * $2
       GROUP BY GREATEST(DATE(c.due), CURRENT_DATE)
       ORDER BY day`,
      [userId, days],
    );

    logger.info(
      { userId, days, rows: result.rows.length, data: result.rows.slice(0, 5) },
      "WorkloadForecast — resultados",
    );

    return result.rows;
  }

  async getCardsForRecall(userId: number): Promise<RecallCardRow[]> {
    const result = await pool.query(
      `SELECT
        c.id,
        c.front,
        c.stability,
        c.due
       FROM cards c
       JOIN decks d
         ON d.id = c.deck_id
       WHERE d.user_id = $1`,
      [userId],
    );

    return result.rows;
  }
}

export const analyticsRepository = new AnalyticsRepository();
