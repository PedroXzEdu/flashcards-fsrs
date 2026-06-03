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
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./config/logger";
import { env } from "./config/env";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      reportOnly: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
      },
    },
  }),
);
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
app.use(
  compression({
    threshold: 0,
  }),
);

app.use(requestId);

app.use(
  pinoHttp({
    logger,
    quietReqLogger: true,
    customReceivedMessage: function (_req) {
      return `incoming request`;
    },
    customSuccessMessage: function (req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: function (req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    genReqId: function (req) {
      return (req as any).requestId;
    },
    autoLogging: {
      ignore: function (req) {
        return (req as any).url === "/health";
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

app.use(routes);

app.use("/analytics", analyticsRoutes);

app.use(errorHandler);

export { app };
