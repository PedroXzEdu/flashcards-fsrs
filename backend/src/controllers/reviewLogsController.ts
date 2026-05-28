import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { reviewLogsService } from "../services/reviewLogsService";

export async function getReviewLogs(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewLogsService.getRecent(req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDailyStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewLogsService.getDailyStats(req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStreak(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewLogsService.getStreak(req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getActivity(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewLogsService.getActivity(req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getGlobalStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reviewLogsService.getGlobalStats(req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
