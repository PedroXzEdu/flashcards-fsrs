import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import { ping } from "../database/db";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8"),
);

export async function healthCheck(_req: Request, res: Response) {
  const dbConnected = await ping();
  const mem = process.memoryUsage();

  res.json({
    success: true,
    data: {
      status: dbConnected ? "ok" : "degraded",
      db: dbConnected ? "connected" : "disconnected",
      fsrs: pkg.dependencies["ts-fsrs"] || "unknown",
      uptime: process.uptime(),
      memoryUsage: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
      },
    },
  });
}
