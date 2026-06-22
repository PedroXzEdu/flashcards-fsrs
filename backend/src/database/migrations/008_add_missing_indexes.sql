CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id_card_id ON review_logs (user_id, card_id);
