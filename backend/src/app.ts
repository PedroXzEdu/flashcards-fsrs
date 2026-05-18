import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { routes } from "./routes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
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
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Flashcards FSRS funcionando!",
  });
});

app.use("/media", express.static(path.join(__dirname, "../uploads/media")));

app.use(routes);

app.use("/analytics", analyticsRoutes);

app.use(errorHandler);

export { app };
