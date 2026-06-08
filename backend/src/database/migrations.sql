CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

ALTER TABLE decks ADD COLUMN IF NOT EXISTS new_cards_per_day INTEGER DEFAULT 20;

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

ALTER TABLE decks ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_cards_due ON cards (due);

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards (deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id_due ON cards (deck_id, due);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON review_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_card_id ON review_logs (card_id);

-- Índices compostos da Fase 03
CREATE INDEX IF NOT EXISTS idx_cards_deck_state_due
  ON cards (deck_id, state, due);

CREATE INDEX IF NOT EXISTS idx_review_logs_user_id_review
  ON review_logs (user_id, review);

CREATE INDEX IF NOT EXISTS idx_review_logs_card_id_review
  ON review_logs (card_id, review);

CREATE INDEX IF NOT EXISTS idx_decks_user_id_created_at
  ON decks (user_id, created_at);
