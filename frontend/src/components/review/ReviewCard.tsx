import { RotateCcw } from "lucide-react";
import type { Card } from "../../types";
import CardContent from "../CardContent";

interface ReviewCardProps {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
}

export default function ReviewCard({ card, flipped, onFlip }: ReviewCardProps) {
  return (
    <div
      className="card-flip-container"
      style={{ marginBottom: "16px", minHeight: "280px" }}
    >
      <div
        className={`card-flip-inner ${flipped ? "flipped" : ""}`}
        style={{ minHeight: "280px" }}
      >
        <div
          className="card-face"
          tabIndex={flipped ? undefined : 0}
          role="button"
          aria-label={flipped ? "Card virado" : "Clique para virar o card"}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              onFlip();
            }
          }}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px)",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
          onClick={onFlip}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            FRENTE
          </span>
          <CardContent
            html={card?.front ?? ""}
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 500,
              color: "var(--text)",
              textAlign: "center",
            }}
          />
          {!flipped && (
            <p
              style={{
                margin: "24px 0 0",
                fontSize: "12px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RotateCcw size={11} /> Clique para virar
            </p>
          )}
        </div>

        <div
          className="card-face card-face-back"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent)",
            borderRadius: "20px",
            padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px)",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 0 1px var(--accent), var(--shadow-sm)`,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            VERSO
          </span>
          <CardContent
            html={card?.back ?? ""}
            style={{
              margin: 0,
              fontSize: "17px",
              color: "var(--text-sub)",
              textAlign: "center",
            }}
          />
        </div>
      </div>
      <style>{`
        .card-face {
          min-height: clamp(200px, 40vh, 280px) !important;
        }
      `}</style>
    </div>
  );
}
