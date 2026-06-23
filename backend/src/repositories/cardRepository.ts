import { pool } from "../database/db";
import { PoolClient } from "pg";

export interface CreateCardInput {
  deck_id: number;
  front: string;
  back: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  due: Date;
  learning_steps?: number;
}

export interface CardRow {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  due: Date;
  last_review: Date | null;
  created_at: Date;
  learning_steps: number;
}

export interface QueueCardRow {
  id: number;
  front: string;
  back: string;
  stability: number;
  due: Date;
  state: number;
  predicted_recall: number;
}

export interface PaginatedCards {
  rows: CardRow[];
  total: number;
}

export interface FsrsUpdateData {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  due: Date;
  last_review?: Date;
  learning_steps: number;
}

class CardRepository {
  async findByDeckId(deckId: number): Promise<CardRow[]> {
    const result = await pool.query(
      `SELECT *
       FROM cards
       WHERE deck_id = $1`,
      [deckId],
    );

    return result.rows;
  }

  async findByDeckIdPaginated(deckId: number, page = 1, limit = 20): Promise<PaginatedCards> {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM cards WHERE deck_id = $1`,
      [deckId],
    );

    const result = await pool.query(
      `SELECT *
       FROM cards
       WHERE deck_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [deckId, limit, offset],
    );

    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async findDailyQueue(userId: number, limit = 50): Promise<QueueCardRow[]> {
    const result = await pool.query(
      `SELECT c.id, c.front, c.back, c.stability, c.due, c.state,
              ROUND(
                EXP(-GREATEST(EXTRACT(EPOCH FROM NOW() - c.due) / 86400, 0)
                    / COALESCE(NULLIF(c.stability, 0), 1)) * 100, 2
              ) AS predicted_recall
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE d.user_id = $1
       ORDER BY
         CASE WHEN c.state = 0 THEN 1 ELSE 0 END,
         CASE WHEN c.state = 0 THEN c.created_at END ASC NULLS LAST,
         predicted_recall ASC
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows;
  }

  async findDueByDeck(deckId: number, userId: number, limit = 200): Promise<CardRow[]> {
    const result = await pool.query(
      `SELECT c.*
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE c.deck_id = $1
         AND d.user_id = $2
         AND c.due <= NOW()
       ORDER BY
         CASE WHEN c.state = 0 THEN 1 ELSE 0 END,
         CASE WHEN c.state = 0 THEN c.created_at END ASC NULLS LAST,
         CASE WHEN c.state > 0 THEN
           EXP(-GREATEST(EXTRACT(EPOCH FROM NOW() - c.due) / 86400, 0)
               / COALESCE(NULLIF(c.stability, 0), 1)) * 100
         END ASC NULLS LAST
       LIMIT $3`,
      [deckId, userId, limit],
    );

    return result.rows;
  }

  async create(data: CreateCardInput, client?: PoolClient): Promise<CardRow> {
    const db = client ?? pool;
    const learningSteps = data.learning_steps ?? 0;
    const result = await db.query(
      `INSERT INTO cards
        (
          deck_id,
          front,
          back,
          stability,
          difficulty,
          elapsed_days,
          scheduled_days,
          reps,
          lapses,
          state,
          due,
          learning_steps
        )
       VALUES
        (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,$11,$12
        )
       RETURNING *`,
      [
        data.deck_id,
        data.front,
        data.back,
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.reps,
        data.lapses,
        data.state,
        data.due,
        learningSteps,
      ],
    );

    return result.rows[0];
  }

  async createBatch(
    deckId: number,
    cards: Omit<CreateCardInput, "deck_id">[],
    client?: PoolClient,
  ): Promise<CardRow[]> {
    const db = client ?? pool;
    if (cards.length === 0) return [];

    const now = new Date();
    const values: unknown[] = [];
    const placeholders: string[] = [];

    cards.forEach((card, i) => {
      const base = i * 13;
      const learningSteps = card.learning_steps ?? 0;
      placeholders.push(
        `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base + 9},$${base + 10},$${base + 11},$${base + 12},$${base + 13})`,
      );
      values.push(
        deckId,
        card.front,
        card.back,
        card.stability,
        card.difficulty,
        card.elapsed_days,
        card.scheduled_days,
        card.reps,
        card.lapses,
        card.state,
        card.due,
        now,
        learningSteps,
      );
    });

    const result = await db.query(
      `INSERT INTO cards
        (deck_id, front, back, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, due, created_at, learning_steps)
       VALUES ${placeholders.join(", ")}
       RETURNING *`,
      values,
    );

    return result.rows;
  }

  async updateFsrsData(client: PoolClient, cardId: number, data: FsrsUpdateData): Promise<CardRow> {
    const result = await client.query(
      `UPDATE cards
       SET
         stability = $1,
         difficulty = $2,
         elapsed_days = $3,
         scheduled_days = $4,
         reps = $5,
         lapses = $6,
         state = $7,
         due = $8,
         last_review = $9,
         learning_steps = $10
       WHERE id = $11
       RETURNING *`,
      [
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.reps,
        data.lapses,
        data.state,
        data.due,
        data.last_review,
        data.learning_steps,
        cardId,
      ],
    );

    return result.rows[0];
  }

  async findById(id: number, userId: number): Promise<CardRow | undefined> {
    const result = await pool.query(
      `SELECT c.*
     FROM cards c
     JOIN decks d ON d.id = c.deck_id
     WHERE c.id = $1
     AND d.user_id = $2
     LIMIT 1`,
      [id, userId],
    );

    return result.rows[0];
  }

  async update(deckId: number, cardId: number, front: string, back: string): Promise<CardRow | undefined> {
    const result = await pool.query(
      `UPDATE cards SET front = $1, back = $2
       WHERE id = $3 AND deck_id = $4
       RETURNING *`,
      [front, back, cardId, deckId],
    );

    return result.rows[0];
  }

  async getDueCountsByUser(userId: number): Promise<{ deck_id: number; due_count: number }[]> {
    const result = await pool.query(
      `SELECT c.deck_id, COUNT(*)::int AS due_count
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE d.user_id = $1 AND c.due <= NOW()
       GROUP BY c.deck_id`,
      [userId],
    );
    return result.rows;
  }

  async delete(deckId: number, cardId: number): Promise<{ id: number } | undefined> {
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 AND deck_id = $2 RETURNING id`,
      [cardId, deckId],
    );

    return result.rows[0];
  }
}

export const cardRepository = new CardRepository();
