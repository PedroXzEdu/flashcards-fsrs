import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import pinoHttp from "pino-http";

import { routes } from "./routes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { healthCheck } from "./controllers/healthController";
import { requestId } from "./middlewares/requestId";
import { metricsMiddleware } from "./middlewares/metrics";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./config/logger";
import { env } from "./config/env";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "http:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        reportUri: ["/api/csp-report"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), notifications=(), payment=()",
  );
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.post(
  "/api/csp-report",
  express.text({
    type: ["application/csp-report", "application/reports+json"],
    limit: "10kb",
  }),
  (req, res) => {
    try {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (body && typeof body === "object") {
        logger.warn({ cspReport: body }, "CSP Violation Report");
      }
    } catch {
      // ignore malformed reports
    }
    res.status(204).end();
  },
);
app.use(
  compression({
    threshold: 0,
  }),
);

app.use(requestId);

app.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex");
  next();
});

app.use(globalRateLimiter);

app.use(metricsMiddleware);

app.use(
  pinoHttp({
    logger,
    quietReqLogger: true,
    customReceivedMessage: function (_req) {
      return `incoming request`;
    },
    customSuccessMessage: function (req, res, responseTime) {
      return `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;
    },
    customErrorMessage: function (req, res, _err) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customLogLevel: function (_req, res, _err) {
      if (res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customProps: function (req) {
      return {
        userId: req.userId,
      };
    },
    genReqId: function (req) {
      return req.requestId;
    },
    autoLogging: {
      ignore: function (req) {
        return (
          req.url === "/health" || req.url === "/metrics"
        );
      },
    },
  }),
);

app.get("/", (_req, res) => {
  res.json({
    message: "API Flashcards FSRS funcionando!",
  });
});

app.get("/health", healthCheck);

app.use("/media", express.static(path.join(__dirname, "../uploads/media")));

app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
});

app.use(routes);

app.use("/analytics", analyticsRoutes);

app.use(errorHandler);

export { app };
