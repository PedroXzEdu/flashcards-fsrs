CREATE TABLE IF NOT EXISTS review_logs (
  id            SERIAL PRIMARY KEY,
  card_id       INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL,
  state         SMALLINT NOT NULL,
  stability     FLOAT NOT NULL,
  difficulty    FLOAT NOT NULL,
  elapsed_days  INTEGER NOT NULL,
  scheduled_days INTEGER NOT NULL,
  review        TIMESTAMP DEFAULT NOW()
);
