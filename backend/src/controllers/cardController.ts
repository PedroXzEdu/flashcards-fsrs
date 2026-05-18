import { Request, Response } from "express";
import { pool } from "../database/db";
import { AuthRequest } from "../middlewares/auth";
import { createEmptyCard } from "ts-fsrs";
import { sanitizeInput } from "../utils/sanitize";

export async function createCard(req: AuthRequest, res: Response) {
  const { deck_id } = req.params;
  const { front, back } = req.body;

  const sanitizedFront = sanitizeInput(front);
  const sanitizedBack = sanitizeInput(back);

  if (!sanitizedFront || !sanitizedBack) {
    res.status(400).json({ error: "Frente e verso são obrigatórios." });
    return;
  }

  try {
    // Verifica se o deck pertence ao usuário
    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      res.status(404).json({ error: "Baralho não encontrado." });
      return;
    }

    // Cria um card vazio com os valores iniciais do FSRS
    const emptyCard = createEmptyCard();

    const result = await pool.query(
      `INSERT INTO cards
        (deck_id, front, back, stability, difficulty, elapsed_days,
         scheduled_days, reps, lapses, state, due)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        deck_id,
        sanitizedFront,
        sanitizedBack,
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
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getCards(req: AuthRequest, res: Response) {
  const { deck_id } = req.params;

  try {
    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      res.status(404).json({ error: "Baralho não encontrado." });
      return;
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
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function updateCard(req: AuthRequest, res: Response) {
  const { deck_id, card_id } = req.params;
  const { front, back } = req.body;

  const sanitizedFront = sanitizeInput(front);
  const sanitizedBack = sanitizeInput(back);

  if (!sanitizedFront || !sanitizedBack) {
    res.status(400).json({ error: "Frente e verso são obrigatórios." });
    return;
  }

  try {
    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      res.status(404).json({ error: "Baralho não encontrado." });
      return;
    }

    const result = await pool.query(
      `UPDATE cards SET front = $1, back = $2
       WHERE id = $3 AND deck_id = $4
       RETURNING *`,
      [sanitizedFront, sanitizedBack, card_id, deck_id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Card não encontrado." });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function deleteCard(req: AuthRequest, res: Response) {
  const { deck_id, card_id } = req.params;

  try {
    const deck = await pool.query(
      "SELECT id FROM decks WHERE id = $1 AND user_id = $2",
      [deck_id, req.userId],
    );
    if (deck.rows.length === 0) {
      res.status(404).json({ error: "Baralho não encontrado." });
      return;
    }

    const result = await pool.query(
      "DELETE FROM cards WHERE id = $1 AND deck_id = $2 RETURNING id",
      [card_id, deck_id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Card não encontrado." });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}
