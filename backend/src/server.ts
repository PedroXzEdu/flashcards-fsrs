import { app } from "./app";
import { runMigrations } from "./database/db";
import { env } from "./config/env";
import { logger } from "./config/logger";

runMigrations()
  .then(() => {
    app.listen(env.port, "0.0.0.0", () => {
      logger.info(`Server running on port ${env.port}`);
    });
  })
  .catch((err) => {
    logger.error(err, "Failed to start server");
    process.exit(1);
  });
