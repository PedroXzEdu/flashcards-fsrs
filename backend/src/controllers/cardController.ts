import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { cardService } from "../services/cardService";

export async function createCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const card = await cardService.create(
      req.params.deck_id as string,
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

export async function getCards(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const cards = await cardService.list(
      req.params.deck_id as string,
      req.userId!,
    );

    res.json({
      success: true,
      data: cards,
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
    const card = await cardService.update(
      req.params.deck_id as string,
      req.params.card_id as string,
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
    await cardService.delete(
      req.params.deck_id as string,
      req.params.card_id as string,
      req.userId!,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
