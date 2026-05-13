import { Response } from "express";
import { pool } from "../database/db";
import { AuthRequest } from "../middlewares/auth";

export async function getReviewLogs(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
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
      [req.userId],
    );

    res.json({
      success: true,
      data: {
        logs: result.rows,
        total: result.rows.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getDailyStats(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
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
      [req.userId],
    );

    res.json({
      success: true,
      data: {
        daily_stats: result.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getStreak(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT DATE(review) as day
       FROM review_logs
       WHERE user_id = $1
       ORDER BY day DESC`,
      [req.userId],
    );

    const days = result.rows.map((r: { day: string }) =>
      r.day.toString().slice(0, 10),
    );

    if (days.length === 0) {
      res.json({
        success: true,
        data: { streak: 0, longest: 0, total_days: 0, last_review: null },
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    // Só conta streak se estudou hoje ou ontem
    if (days[0] !== today && days[0] !== yesterday) {
      res.json({
        success: true,
        data: {
          streak: 0,
          longest: 0,
          total_days: days.length,
          last_review: days[0],
        },
      });
      return;
    }

    // Calcula streak atual
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

    // Calcula maior streak
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

    res.json({
      success: true,
      data: {
        streak,
        longest,
        total_days: days.length,
        last_review: days[0],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getActivity(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT
        DATE(review) as day,
        COUNT(*) as count
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '365 days'
       GROUP BY DATE(review)
       ORDER BY day ASC`,
      [req.userId],
    );

    res.json({
      success: true,
      data: { activity: result.rows },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getGlobalStats(req: AuthRequest, res: Response) {
  try {
    const cards = await pool.query(
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
      [req.userId],
    );

    const reviews = await pool.query(
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
      [req.userId],
    );

    const decks = await pool.query(
      `SELECT COUNT(*) AS total_decks FROM decks WHERE user_id = $1`,
      [req.userId],
    );

    const daily = await pool.query(
      `SELECT
        DATE(review) AS date,
        COUNT(*)     AS total
       FROM review_logs
       WHERE user_id = $1
         AND review >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(review)
       ORDER BY date ASC`,
      [req.userId],
    );

    res.json({
      success: true,
      data: {
        cards: cards.rows[0],
        reviews: reviews.rows[0],
        decks: decks.rows[0],
        daily: daily.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}
