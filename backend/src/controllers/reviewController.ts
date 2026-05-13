import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/auth";

import { reviewService } from "../services/reviewService";

export async function getReviewCards(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewService.getDueCards(
      req.params.deck_id as string,
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
    const result = await reviewService.previewReview(
      req.params.cardId as string,
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
    const result = await reviewService.submitReview(
      req.params.cardId as string,
      req.userId!,
      req.body.rating,
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
