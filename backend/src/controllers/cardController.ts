import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { cardService } from "../services/cardService";
import { deckIdParams, cardParams } from "../schemas/paramsSchema";

export async function createCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id } = deckIdParams.parse(req.params);
    const card = await cardService.create(
      deck_id,
      req.userId!,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (err) {
    next(err);
  }
}

export async function createCardsBatch(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id } = deckIdParams.parse(req.params);
    const cards = await cardService.createBatch(
      deck_id,
      req.userId!,
      req.body.cards,
    );

    res.status(201).json({
      success: true,
      data: cards,
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
    const { page, limit } = req.query as unknown as { page: number; limit: number };

    const { deck_id } = deckIdParams.parse(req.params);
    const result = await cardService.list(
      deck_id,
      req.userId!,
      page,
      limit,
    );

    res.json({
      success: true,
      data: {
        cards: result.cards,
        pagination: result.pagination,
      },
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
    const { deck_id, card_id } = cardParams.parse(req.params);
    const card = await cardService.update(
      deck_id,
      card_id,
      req.userId!,
      req.body,
    );

    res.json({
      success: true,
      data: card,
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
    const { deck_id, card_id } = cardParams.parse(req.params);
    await cardService.delete(
      deck_id,
      card_id,
      req.userId!,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
