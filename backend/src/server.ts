import { app } from "./app";
import { runMigrations } from "./database/db";

const PORT = process.env.PORT || 3000;

runMigrations()
  .then(() => {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
