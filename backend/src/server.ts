import { app } from "./app";
import { runMigrations } from "./database/db";
import { env } from "./config/env";

runMigrations()
  .then(() => {
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`Server running on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
