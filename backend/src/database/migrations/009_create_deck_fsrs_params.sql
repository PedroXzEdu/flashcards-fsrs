CREATE TABLE IF NOT EXISTS deck_fsrs_params (
  deck_id INTEGER PRIMARY KEY REFERENCES decks(id) ON DELETE CASCADE,
  request_retention DOUBLE PRECISION DEFAULT 0.9,
  maximum_interval INTEGER DEFAULT 36500,
  enable_fuzz BOOLEAN DEFAULT false,
  enable_short_term BOOLEAN DEFAULT true,
  learning_steps TEXT DEFAULT '1m,10m',
  relearning_steps TEXT DEFAULT '10m'
);
