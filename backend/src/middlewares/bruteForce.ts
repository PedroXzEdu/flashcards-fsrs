import { Request, Response, NextFunction } from "express";

interface BruteForceRecord {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

const attempts = new Map<string, BruteForceRecord>();

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (record.blockedUntil && record.blockedUntil <= now) {
      attempts.delete(key);
    } else if (!record.blockedUntil && now - record.firstAttempt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function bruteForceProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
      cleanup();
      lastCleanup = Date.now();
    }

    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";

    const record = attempts.get(ip);
    if (record?.blockedUntil && record.blockedUntil > Date.now()) {
      return res.status(429).json({
        success: false,
        error:
          "Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em 30 minutos.",
      });
    }

    if (record?.blockedUntil && record.blockedUntil <= Date.now()) {
      attempts.delete(ip);
    }

    res.on("finish", () => {
      if (res.statusCode === 401 || res.statusCode === 404) {
        const now = Date.now();
        const rec = attempts.get(ip) ?? {
          count: 0,
          firstAttempt: now,
          blockedUntil: null,
        };

        if (now - rec.firstAttempt > WINDOW_MS) {
          rec.count = 0;
          rec.firstAttempt = now;
        }

        rec.count++;

        if (rec.count >= MAX_ATTEMPTS) {
          rec.blockedUntil = now + BLOCK_MS;
        }

        attempts.set(ip, rec);
      } else if (res.statusCode === 200) {
        attempts.delete(ip);
      }
    });

    next();
  };
}

// Exported for testing
export function _resetAttempts() {
  attempts.clear();
  lastCleanup = Date.now();
}
