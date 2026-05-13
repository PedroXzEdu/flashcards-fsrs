import express from "express";
import cors from "cors";
import path from "path";

import { routes } from "./routes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
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
