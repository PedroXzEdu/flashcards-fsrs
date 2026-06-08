import { Router, Request, Response } from "express";

import { collector } from "../middlewares/metrics";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const metrics = collector.snapshot();
  const mem = process.memoryUsage();

  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memoryUsage: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
      },
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      errorRate: metrics.errorRate,
      requestsByRoute: metrics.requestsByRoute,
      business: metrics.business,
    },
  });
});

export default router;
