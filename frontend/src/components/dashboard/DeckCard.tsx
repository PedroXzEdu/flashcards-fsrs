import { Trash2 } from "lucide-react";
import type { Deck } from "../../types";

interface DeckCardProps {
  deck: Deck;
  due: number;
  index: number;
  onNavigate: (deckId: number) => void;
  onDelete: (deck: Deck) => void;
}

export default function DeckCard({
  deck,
  due,
  index,
  onNavigate,
  onDelete,
}: DeckCardProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${index * 50}ms`,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "var(--shadow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{ flex: 1 }}
          onClick={() => onNavigate(deck.id)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {deck.title}
            </h2>
            {due > 0 && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "10px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  letterSpacing: "0.3px",
                }}
              >
                {due} hoje
              </span>
            )}
          </div>
          {deck.description && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "var(--text-muted)",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {deck.description}
            </p>
          )}
          <span
            style={{
              fontSize: "12px",
              color: "var(--accent)",
              background: "rgba(203,166,247,0.1)",
              borderRadius: "6px",
              padding: "2px 8px",
              fontWeight: 500,
            }}
          >
            {deck.card_count}{" "}
            {Number(deck.card_count) === 1 ? "card" : "cards"}
          </span>
        </div>
        <button
          type="button"
          aria-label="Excluir baralho"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(deck);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "2px 6px",
            borderRadius: "6px",
            marginLeft: "8px",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--danger)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
