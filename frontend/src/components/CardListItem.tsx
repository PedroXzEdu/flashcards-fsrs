import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Card } from "../types";
import CardContent from "./CardContent";
import Button from "./Button";
import Badge from "./ui/Badge";

interface CardListItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  index?: number;
}

const STATE_MAP: Record<number, "new" | "learning" | "review" | "relearning"> = {
  0: "new",
  1: "learning",
  2: "review",
  3: "relearning",
};

const STATE_LABELS: Record<number, string> = {
  0: "Novo",
  1: "Aprendendo",
  2: "Revisão",
  3: "Reaprendendo",
};

export default function CardListItem({
  card,
  onEdit,
  onDelete,
  index = 0,
}: CardListItemProps) {
  const [hovered, setHovered] = useState(false);
  const variant = STATE_MAP[card.state] ?? "new";

  return (
    <div
      className="animate-slide-in"
      style={{
        animationDelay: `${index * 30}ms`,
        background: "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-sub)" : "var(--border)"}`,
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Badge variant={variant}>{STATE_LABELS[card.state] ?? "Novo"}</Badge>
      <div style={{ flex: 1, minWidth: 0 }}>
        <CardContent
          html={card.front}
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        />
        <CardContent
          html={card.back}
          style={{
            margin: "2px 0 0",
            fontSize: "13px",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        />
      </div>
      {card.tags && card.tags.length > 0 && (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "160px" }}>
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--accent)",
                background: "rgba(203,166,247,0.1)",
                borderRadius: "4px",
                padding: "2px 6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "80px",
              }}
            >
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}
      {card.reps > 0 && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {card.reps} rev.
        </span>
      )}
      <div style={{ display: "flex", gap: "4px" }}>
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={13} />}
          onClick={() => onEdit(card)}
          aria-label="Editar card"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={13} />}
          onClick={() => onDelete(card)}
          style={{ color: "var(--danger)" }}
          aria-label="Excluir card"
        />
      </div>
    </div>
  );
}
