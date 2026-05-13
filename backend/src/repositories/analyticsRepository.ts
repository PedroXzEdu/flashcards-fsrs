import { pool } from "../database/db";

class AnalyticsRepository {
  async getRetentionRate(userId: number) {
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
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0];
  }

  async getReviewHeatmap(userId: number) {
    const result = await pool.query(
      `SELECT
        DATE(created_at) AS day,
        COUNT(*)::int AS reviews
       FROM review_logs
       WHERE user_id = $1
       GROUP BY day
       ORDER BY day`,
      [userId],
    );

    return result.rows;
  }

  async getAverageStability(userId: number) {
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

  async getCardsForRecall(userId: number) {
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
