import { Request, Response } from "express";

export function healthCheck(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      status: "ok",
    },
  });
}
