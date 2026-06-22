CREATE TABLE IF NOT EXISTS cards (
  id            SERIAL PRIMARY KEY,
  deck_id       INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front         TEXT NOT NULL,
  back          TEXT NOT NULL,
  stability     FLOAT DEFAULT 0,
  difficulty    FLOAT DEFAULT 0,
  elapsed_days  INTEGER DEFAULT 0,
  scheduled_days INTEGER DEFAULT 0,
  reps          INTEGER DEFAULT 0,
  lapses        INTEGER DEFAULT 0,
  state         SMALLINT DEFAULT 0,
  due           TIMESTAMP DEFAULT NOW(),
  last_review   TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
