import { PoolClient } from "pg";
import { pool as client } from "../database/db";

class ReviewLogRepository {
  async create(client: PoolClient, data: any) {
    const result = await client.query(
      `INSERT INTO review_logs
        (
          user_id,
          card_id,
          rating,
          state,
          stability,
          difficulty,
          elapsed_days,
          scheduled_days,
          review
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_id,
        data.card_id,
        data.rating,
        data.state,
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.review,
      ],
    );

    return result.rows[0];
  }

  async findRecent(userId: number) {
    const result = await client.query(
      `SELECT
        rl.id,
        rl.rating,
        rl.state,
        rl.stability,
        rl.difficulty,
        rl.elapsed_days,
        rl.scheduled_days,
        rl.review,
        c.front,
        c.back,
        d.title AS deck_title
       FROM review_logs rl
       JOIN cards c ON c.id = rl.card_id
       JOIN decks d ON d.id = c.deck_id
       WHERE rl.user_id = $1
       ORDER BY rl.review DESC
       LIMIT 100`,
      [userId],
    );

    return result.rows;
  }

  async getDailyStats(userId: number) {
    const result = await client.query(
      `SELECT
        DATE(review)                                        AS date,
        COUNT(*)                                            AS total_reviews,
        COUNT(*) FILTER (WHERE rating = 1)                 AS again,
        COUNT(*) FILTER (WHERE rating = 2)                 AS hard,
        COUNT(*) FILTER (WHERE rating = 3)                 AS good,
        COUNT(*) FILTER (WHERE rating = 4)                 AS easy,
        ROUND(
          COUNT(*) FILTER (WHERE rating >= 2)::numeric
          / NULLIF(COUNT(*), 0) * 100, 1
        )                                                  AS retention_rate
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(review)
       ORDER BY date DESC`,
      [userId],
    );

    return result.rows;
  }

  async getReviewDays(userId: number, months = 12) {
    const [dates, days] = await Promise.all([
      client.query(
        `SELECT
           CURRENT_DATE::text AS today,
           (CURRENT_DATE - INTERVAL '1 day')::text AS yesterday`,
      ),
      client.query(
        `SELECT DISTINCT DATE(review)::text AS day
         FROM review_logs
         WHERE user_id = $1
           AND review >= NOW() - INTERVAL '1 month' * $2
         ORDER BY day DESC`,
        [userId, months],
      ),
    ]);

    return {
      days: days.rows.map((r: { day: string }) => r.day),
      today: dates.rows[0].today,
      yesterday: dates.rows[0].yesterday,
    };
  }

  async getActivity(userId: number) {
    const result = await client.query(
      `SELECT
        DATE(review) as day,
        COUNT(*) as count
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '365 days'
       GROUP BY DATE(review)
       ORDER BY day ASC`,
      [userId],
    );

    return result.rows;
  }

  async getGlobalStats(userId: number) {
    const cards = await client.query(
      `SELECT
        COUNT(*)                                      AS total_cards,
        COUNT(*) FILTER (WHERE state = 0)             AS new_cards,
        COUNT(*) FILTER (WHERE state IN (1,3))        AS learning,
        COUNT(*) FILTER (WHERE state = 2)             AS reviewing,
        COUNT(*) FILTER (WHERE due <= NOW())          AS due_today,
        ROUND(AVG(difficulty)::numeric, 2)            AS avg_difficulty,
        ROUND(AVG(stability)::numeric, 2)             AS avg_stability
       FROM cards
       WHERE deck_id IN (
         SELECT id FROM decks WHERE user_id = $1
       )`,
      [userId],
    );

    const reviews = await client.query(
      `SELECT
        COUNT(*)                                            AS total_reviews,
        COUNT(*) FILTER (WHERE rating = 1)                 AS again_count,
        COUNT(*) FILTER (WHERE rating = 2)                 AS hard_count,
        COUNT(*) FILTER (WHERE rating = 3)                 AS good_count,
        COUNT(*) FILTER (WHERE rating = 4)                 AS easy_count,
        ROUND(
          COUNT(*) FILTER (WHERE rating >= 2)::numeric
          / NULLIF(COUNT(*), 0) * 100, 1
        )                                                  AS retention_rate
       FROM review_logs
       WHERE user_id = $1`,
      [userId],
    );

    const decks = await client.query(
      `SELECT COUNT(*) AS total_decks FROM decks WHERE user_id = $1`,
      [userId],
    );

    const daily = await client.query(
      `SELECT
        DATE(review) AS date,
        COUNT(*)     AS total
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(review)
       ORDER BY date ASC`,
      [userId],
    );

    return {
      cards: cards.rows[0],
      reviews: reviews.rows[0],
      decks: decks.rows[0],
      daily: daily.rows,
    };
  }
}

export const reviewLogRepository = new ReviewLogRepository();
