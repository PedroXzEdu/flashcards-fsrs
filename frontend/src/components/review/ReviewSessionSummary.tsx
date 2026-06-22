import { Check } from "lucide-react";

interface ReviewSessionSummaryProps {
  reviewed: number;
  history: ("correct" | "wrong")[];
  onGoHome: () => void;
  onGoToDeck: () => void;
}

export default function ReviewSessionSummary({
  reviewed,
  history,
  onGoHome,
  onGoToDeck,
}: ReviewSessionSummaryProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "24px",
          padding: "48px",
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(166,227,161,0.15)",
            border: "1px solid rgba(166,227,161,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Check size={28} color="var(--success)" />
        </div>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.4px",
          }}
        >
          Sessão concluída!
        </h1>
        <p
          style={{
            color: "var(--text-sub)",
            margin: "0 0 6px",
            fontSize: "14px",
          }}
        >
          Você revisou{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>
            {reviewed}
          </span>{" "}
          {reviewed === 1 ? "card" : "cards"} hoje.
        </p>

        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            margin: "16px 0 24px",
            flexWrap: "wrap",
          }}
        >
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background:
                  h === "correct" ? "var(--success)" : "var(--danger)",
              }}
            />
          ))}
        </div>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "13px",
            margin: "0 0 28px",
          }}
        >
          O FSRS agendou as próximas revisões automaticamente.
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "center" }}
        >
          <button
            type="button"
            onClick={onGoHome}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 24px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Ir para o início
          </button>
          <button
            type="button"
            onClick={onGoToDeck}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "10px",
              color: "var(--bg)",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 24px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Voltar ao baralho
          </button>
        </div>
      </div>
    </div>
  );
}
