import { Response, NextFunction } from "express";
import { pool } from "../database/db";
import { AuthRequest } from "../middlewares/auth";
import { createEmptyCard } from "ts-fsrs";
import { AppError } from "../utils/AppError";

export async function createCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id } = req.params;
    const { front, back } = req.body;

    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const emptyCard = createEmptyCard();

    const result = await pool.query(
      `INSERT INTO cards
        (deck_id, front, back, stability, difficulty, elapsed_days,
         scheduled_days, reps, lapses, state, due)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        deck_id,
        front,
        back,
        emptyCard.stability,
        emptyCard.difficulty,
        emptyCard.elapsed_days,
        emptyCard.scheduled_days,
        emptyCard.reps,
        emptyCard.lapses,
        emptyCard.state,
        emptyCard.due,
      ],
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

export async function getCards(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id } = req.params;

    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const result = await pool.query(
      "SELECT * FROM cards WHERE deck_id = $1 ORDER BY created_at DESC",
      [deck_id],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id, card_id } = req.params;
    const { front, back } = req.body;

    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const result = await pool.query(
      `UPDATE cards SET front = $1, back = $2
       WHERE id = $3 AND deck_id = $4
       RETURNING *`,
      [front, back, card_id, deck_id],
    );

    if (result.rows.length === 0) {
      throw new AppError("Card não encontrado.", 404);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id, card_id } = req.params;

    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const result = await pool.query(
      "DELETE FROM cards WHERE id = $1 AND deck_id = $2 RETURNING id",
      [card_id, deck_id],
    );

    if (result.rows.length === 0) {
      throw new AppError("Card não encontrado.", 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
