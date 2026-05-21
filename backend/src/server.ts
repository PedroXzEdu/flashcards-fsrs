import { app } from "./app";
import { runMigrations, pool } from "./database/db";
import { env } from "./config/env";
import { logger } from "./config/logger";

async function shutdown(signal: string, server: import("http").Server) {
  logger.info({ signal }, "Shutdown signal received, closing server...");

  server.close((err) => {
    if (err) {
      logger.error(err, "Error closing HTTP server");
    } else {
      logger.info("HTTP server closed");
    }

    pool
      .end()
      .then(() => {
        logger.info("Database pool closed");
      })
      .catch((dbErr) => {
        logger.error(dbErr, "Error closing database pool");
      });
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.kill(process.pid, "SIGKILL");
  }, 10_000).unref();
}

runMigrations()
  .then(() => {
    const server = app.listen(env.port, "0.0.0.0", () => {
      logger.info(`Server running on port ${env.port}`);
    });

    process.on("SIGTERM", () => shutdown("SIGTERM", server));
    process.on("SIGINT", () => shutdown("SIGINT", server));
  })
  .catch((err) => {
    logger.error(err, "Failed to start server");
    process.exit(1);
  });
