export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Deck {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  card_count: number;
  new_cards_per_day: number;
  share_token: string | null;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  due: string;
  last_review: string | null;
  created_at: string;
}

export interface ReviewLog {
  id: number;
  rating: number;
  state: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: string;
  front: string;
  back: string;
  deck_title: string;
}

export interface DeckStats {
  cards: {
    total: string;
    new_cards: string;
    learning: string;
    reviewing: string;
    due_today: string;
    avg_difficulty: string;
    avg_stability: string;
    lapses: string;
  };
  reviews: {
    total_reviews: string;
    again_count: string;
    hard_count: string;
    good_count: string;
    easy_count: string;
    retention_rate: string;
  };
}

export interface PreviewRatings {
  again: { due: string; scheduled_days: number };
  hard: { due: string; scheduled_days: number };
  good: { due: string; scheduled_days: number };
  easy: { due: string; scheduled_days: number };
}

export interface GlobalStats {
  cards: {
    total_cards: string;
    new_cards: string;
    learning: string;
    reviewing: string;
    due_today: string;
    avg_difficulty: string;
    avg_stability: string;
  };
  reviews: {
    total_reviews: string;
    again_count: string;
    hard_count: string;
    good_count: string;
    easy_count: string;
    retention_rate: string;
  };
  decks: {
    total_decks: string;
  };
  daily: { date: string; total: string }[];
}
