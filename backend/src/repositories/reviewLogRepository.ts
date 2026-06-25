import { PoolClient } from "pg";
import { pool as client } from "../database/db";
import { Rating } from "ts-fsrs";

export interface CreateReviewLogInput {
  user_id: number;
  card_id: number;
  rating: Rating;
  state: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: Date;
}

export interface ReviewLogRow {
  id: number;
  user_id: number;
  card_id: number;
  rating: number;
  state: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: Date;
}

interface RecentReviewRow {
  id: number;
  rating: number;
  state: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: Date;
  front: string;
  back: string;
  deck_title: string;
}

interface DailyStatsRow {
  date: string;
  total_reviews: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  retention_rate: number;
}

interface ActivityRow {
  day: string;
  count: number;
}

interface ReviewDaysResult {
  days: string[];
  today: string;
  yesterday: string;
}

interface GlobalStatsCards {
  total_cards: number;
  new_cards: number;
  learning: number;
  reviewing: number;
  due_today: number;
  avg_difficulty: number;
  avg_stability: number;
}

interface GlobalStatsReviews {
  total_reviews: number;
  again_count: number;
  hard_count: number;
  good_count: number;
  easy_count: number;
  retention_rate: number;
}

interface GlobalStatsDecks {
  total_decks: number;
}

interface GlobalStatsDaily {
  date: string;
  total: number;
}

interface GlobalStatsResult {
  cards: GlobalStatsCards;
  reviews: GlobalStatsReviews;
  decks: GlobalStatsDecks;
  daily: GlobalStatsDaily[];
}

class ReviewLogRepository {
  async create(client: PoolClient, data: CreateReviewLogInput): Promise<ReviewLogRow> {
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

  async findRecent(userId: number): Promise<RecentReviewRow[]> {
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

  async getDailyStats(userId: number): Promise<DailyStatsRow[]> {
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

  async getReviewDays(userId: number, months = 12): Promise<ReviewDaysResult> {
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

  async getActivity(userId: number): Promise<ActivityRow[]> {
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

  // As 4 queries abaixo são mantidas separadas intencionalmente:
  // - Operam em 3 tabelas diferentes (cards, review_logs, decks)
  // - daily retorna múltiplas linhas (as demais são single-row)
  // - Combinar com CTE exigiria subqueries JSON, prejudicando legibilidade
  // - Ganho de performance marginal (~2-3ms em ambiente local)
  async getGlobalStats(userId: number): Promise<GlobalStatsResult> {
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

    const dailyMap = new Map(daily.rows.map((r: GlobalStatsDaily) => [r.date, Number(r.total)]));
    const now = new Date();
    const filledDaily: GlobalStatsDaily[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      filledDaily.push({
        date: dateStr,
        total: dailyMap.get(dateStr) ?? 0,
      });
    }

    return {
      cards: cards.rows[0],
      reviews: reviews.rows[0],
      decks: decks.rows[0],
      daily: filledDaily,
    };
  }
}

export const reviewLogRepository = new ReviewLogRepository();
