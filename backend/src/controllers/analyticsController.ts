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
    const { months } = req.query as unknown as { months: number };

    const result = await analyticsService.getRetentionRate(req.userId!, months);

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
    const { months } = req.query as unknown as { months: number };

    const result = await analyticsService.getReviewHeatmap(req.userId!, months);

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
    const { days } = req.query as unknown as { days: number };

    const result = await analyticsService.getWorkloadForecast(
      req.userId!,
      days,
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
