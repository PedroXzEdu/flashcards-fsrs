import { Request, Response, NextFunction } from "express";
import { pool } from "../database/db";
import { AuthRequest } from "../middlewares/auth";
import { deckService } from "../services/deckService";
import { deckImportService } from "../services/deckImportService";

export async function createDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const deck = await deckService.create({
      ...req.body,
      userId: req.userId,
    });

    return res.status(201).json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDecks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const decks = await deckService.list(req.userId!);

    return res.json({
      success: true,
      data: decks,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const deck = await deckService.get(req.params.id as string, req.userId!);

    return res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const deck = await deckService.update(
      req.params.id as string,
      req.userId!,
      req.body,
    );

    return res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await deckService.delete(req.params.id as string, req.userId!);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getDeckStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await deckService.getStats(
      req.params.id as string,
      req.userId!,
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDeckSettings(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const deck = await deckService.updateSettings(
      req.params.id as string,
      req.userId!,
      req.body,
    );

    return res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
}

export async function shareDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deckService.share(
      req.params.id as string,
      req.userId!,
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function unshareDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deckService.unshare(
      req.params.id as string,
      req.userId!,
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function importSharedDeck(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deckImportService.importSharedDeck(
      req.params.token as string,
      req.userId!,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSharedDeckPreview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const deck = await deckService.previewSharedDeck(
      req.params.token as string,
    );

    return res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
}
