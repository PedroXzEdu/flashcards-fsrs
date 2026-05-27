import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/auth";

import { analyticsService } from "../services/analyticsService";
import { priorityQueueService } from "../services/priorityQueueService";

export async function getRetentionRate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await analyticsService.getRetentionRate(req.userId!);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReviewHeatmap(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await analyticsService.getReviewHeatmap(req.userId!);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getForgettingCurve(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await analyticsService.getForgettingCurve(req.userId!);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPredictedRecall(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await analyticsService.getPredictedRecall(req.userId!);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkloadForecast(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const days = Math.min(
      Math.max(parseInt(req.query.days as string) || 30, 7),
      30,
    );

    const allowed = [7, 14, 30];
    const clamped = allowed.includes(days) ? days : 30;

    const result = await analyticsService.getWorkloadForecast(
      req.userId!,
      clamped,
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDailyQueue(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const queue = await priorityQueueService.getDailyQueue(req.userId!);

    return res.json({
      success: true,
      data: queue,
    });
  } catch (err) {
    next(err);
  }
}
