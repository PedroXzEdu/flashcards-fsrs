import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/auth";

import { reviewService } from "../services/reviewService";
import { deckIdParams, cardIdCamelParams } from "../schemas/paramsSchema";

export async function getDueCounts(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewService.getDueCounts(req.userId!);
    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReviewCards(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { deck_id } = deckIdParams.parse(req.params);
    const result = await reviewService.getDueCards(
      deck_id,
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

export async function previewReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { cardId } = cardIdCamelParams.parse(req.params);
    const result = await reviewService.previewReview(
      cardId,
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

export async function submitReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { cardId } = cardIdCamelParams.parse(req.params);
    const result = await reviewService.submitReview(
      cardId,
      req.userId!,
      req.body.rating,
    );

    const { new_achievements, ...reviewData } = result;

    return res.json({
      success: true,
      data: {
        ...reviewData,
        ...(new_achievements && new_achievements.length > 0 ? { new_achievements } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
}
