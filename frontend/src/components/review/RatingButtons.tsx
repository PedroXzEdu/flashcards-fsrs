import { useState } from "react";
import type { PreviewRatings } from "../../types";
import Tooltip from "../Tooltip";

const RATINGS = [
  {
    value: 1,
    label: "De novo",
    key: "again",
    color: "var(--danger)",
    bg: "rgba(243,139,168,0.12)",
    border: "rgba(243,139,168,0.4)",
    tooltip: "Não lembrei. Voltar ao início.",
  },
  {
    value: 2,
    label: "Difícil",
    key: "hard",
    color: "var(--warning)",
    bg: "rgba(249,226,175,0.12)",
    border: "rgba(249,226,175,0.4)",
    tooltip: "Lembrei com esforço. Intervalo curto.",
  },
  {
    value: 3,
    label: "Bom",
    key: "good",
    color: "var(--success)",
    bg: "rgba(166,227,161,0.12)",
    border: "rgba(166,227,161,0.4)",
    tooltip: "Lembrei bem. Intervalo normal.",
  },
  {
    value: 4,
    label: "Fácil",
    key: "easy",
    color: "var(--info)",
    bg: "rgba(137,180,250,0.12)",
    border: "rgba(137,180,250,0.4)",
    tooltip: "Muito fácil. Intervalo longo.",
  },
];

function formatInterval(days: number) {
  if (days < 1 / 1440) return "≤1m";
  const totalMinutes = days * 1440;
  const minutes = Math.round(totalMinutes);
  if (minutes < 60) return `${minutes}m`;
  const totalHours = days * 24;
  const hours = Math.round(totalHours);
  if (hours < 24) return `${hours}h`;
  const totalDays = days;
  if (totalDays < 30) return `${Math.round(totalDays)}d`;
  const totalMonths = totalDays / 30.44;
  if (totalMonths < 12) return `${Math.round(totalMonths)}mo`;
  const years = Math.round(totalDays / 365.25);
  return `${years}y`;
}

interface RatingButtonsProps {
  preview: PreviewRatings | null;
  submitting: boolean;
  onRate: (rating: number) => void;
  flipped: boolean;
  error: string;
}

export default function RatingButtons({
  preview,
  submitting,
  onRate,
  flipped,
  error,
}: RatingButtonsProps) {
  return (
    <>
      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "var(--text-muted)",
          margin: "12px 0",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        pressione{" "}
        {[1, 2, 3, 4].map((n) => (
          <kbd
            key={n}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1px 5px",
              fontSize: "10px",
            }}
          >
            {n}
          </kbd>
        ))}{" "}
        para avaliar ·{" "}
        <kbd
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "1px 5px",
            fontSize: "10px",
          }}
        >
          espaço
        </kbd>{" "}
        para virar
      </p>
      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(243,139,168,0.1)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            fontSize: "13px",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      {flipped && (
        <div
          className="animate-fade-in rating-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
        >
          {RATINGS.map((r) => (
            <RatingButton
              key={r.value}
              r={r}
              preview={preview}
              submitting={submitting}
              onRate={onRate}
            />
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 480px) {
          .rating-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 360px) {
          .rating-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

function RatingButton({
  r,
  preview,
  submitting,
  onRate,
}: {
  r: (typeof RATINGS)[0];
  preview: PreviewRatings | null;
  submitting: boolean;
  onRate: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const days = preview?.[r.key as keyof PreviewRatings]?.scheduled_days ?? null;

  return (
    <Tooltip text={r.tooltip}>
      <button
        type="button"
        onClick={() => onRate(r.value)}
        disabled={submitting}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          width: "100%",
          background: r.bg,
          border: `1px solid ${hovered ? r.color : r.border}`,
          borderRadius: "14px",
          padding: "14px 8px",
          cursor: submitting ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          opacity: submitting ? 0.6 : 1,
          transform: pressed
            ? "scale(0.96)"
            : hovered
              ? "translateY(-2px)"
              : "none",
          boxShadow:
            hovered && !submitting ? `0 6px 16px rgba(0,0,0,0.2)` : "none",
          transition:
            "transform 120ms ease, background-color 150ms ease, box-shadow 150ms ease",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: r.color }}>
          {r.label}
        </span>
        {days !== null && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {formatInterval(days)}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
