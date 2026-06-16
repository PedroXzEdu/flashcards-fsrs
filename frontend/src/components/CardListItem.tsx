import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Card } from "../types";
import CardContent from "./CardContent";
import Button from "./Button";

interface CardListItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  index?: number;
}

const STATE_CONFIG = [
  { label: "Novo", color: "var(--info)", bg: "rgba(137,180,250,0.12)" },
  { label: "Aprendendo", color: "var(--warning)", bg: "rgba(249,226,175,0.12)" },
  { label: "Revisão", color: "var(--success)", bg: "rgba(166,227,161,0.12)" },
  { label: "Reaprendendo", color: "var(--danger)", bg: "rgba(243,139,168,0.12)" },
];

export default function CardListItem({
  card,
  onEdit,
  onDelete,
  index = 0,
}: CardListItemProps) {
  const [hovered, setHovered] = useState(false);
  const s = STATE_CONFIG[card.state] ?? STATE_CONFIG[0];

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
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: "6px",
          color: s.color,
          background: s.bg,
          whiteSpace: "nowrap",
          minWidth: "80px",
          textAlign: "center",
        }}
      >
        {s.label}
      </span>
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
