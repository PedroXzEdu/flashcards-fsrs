import { BookOpen } from "lucide-react";
import type { Deck } from "../../types";
import { SkeletonDeckCard } from "../SkeletonCard";
import DeckCard from "./DeckCard";

interface DeckListProps {
  decks: Deck[];
  dueCounts: Record<number, number>;
  loading: boolean;
  onNavigate: (deckId: number) => void;
  onDelete: (deck: Deck) => void;
}

export default function DeckList({
  decks,
  dueCounts,
  loading,
  onNavigate,
  onDelete,
}: DeckListProps) {
  if (loading) {
    return (
      <div
        className="deck-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {[1, 2, 3].map((i) => (
          <SkeletonDeckCard key={i} />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <BookOpen size={28} color="var(--text-muted)" />
        </div>
        <p style={{ color: "var(--text-sub)", margin: 0, fontWeight: 500 }}>
          Nenhum baralho ainda.
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "13px",
            marginTop: "4px",
          }}
        >
          Crie seu primeiro baralho para começar!
        </p>
      </div>
    );
  }

  return (
    <div
      className="deck-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {decks.map((deck, i) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          due={dueCounts[deck.id] ?? 0}
          index={i}
          onNavigate={onNavigate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
