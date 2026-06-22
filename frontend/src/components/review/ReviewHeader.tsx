import { Sun, Moon, X, Shuffle } from "lucide-react";

interface ReviewHeaderProps {
  onExit: () => void;
  history: ("correct" | "wrong")[];
  index: number;
  total: number;
  shuffled: boolean;
  onShuffleToggle: () => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export default function ReviewHeader({
  onExit,
  history,
  index,
  total,
  shuffled,
  onShuffleToggle,
  theme,
  onThemeToggle,
}: ReviewHeaderProps) {
  return (
    <header
      style={{
        background: "var(--bg-alt)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        type="button"
        onClick={onExit}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: "13px",
          padding: "7px 9px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <X size={15} /> Encerrar
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "3px",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  i < history.length
                    ? history[i] === "correct"
                      ? "var(--success)"
                      : "var(--danger)"
                    : i === index
                      ? "var(--accent)"
                      : "var(--border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Embaralhar ordem dos cards"
          onClick={onShuffleToggle}
          title="Embaralhar"
          style={{
            background: shuffled
              ? "rgba(203,166,247,0.15)"
              : "var(--bg-card)",
            border: `1px solid ${shuffled ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "6px",
            cursor: "pointer",
            padding: "5px 7px",
            display: "flex",
            alignItems: "center",
            color: shuffled ? "var(--accent)" : "var(--text-sub)",
          }}
        >
          <Shuffle size={13} />
        </button>
        <button
          type="button"
          aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
          onClick={onThemeToggle}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            padding: "5px 7px",
            display: "flex",
            alignItems: "center",
            color: "var(--text-sub)",
          }}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </header>
  );
}
