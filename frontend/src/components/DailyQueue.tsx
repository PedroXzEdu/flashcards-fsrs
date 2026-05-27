import { useEffect, useState } from "react";
import { getDailyQueue } from "../services/analyticsApi";
import { Calendar } from "lucide-react";

interface DailyQueueCard {
  id: number;
  front: string;
  predicted_recall: number;
}

export function DailyQueue() {
  const [queue, setQueue] = useState<DailyQueueCard[]>([]);

  useEffect(() => {
    async function loadQueue() {
      const data = await getDailyQueue();
      setQueue(data);
    }

    loadQueue();
  }, []);

  function getRecallStyle(retention: number) {
    if (retention >= 80)
      return {
        background: "rgba(166,227,161,0.2)",
        border: "1px solid rgba(166,227,161,0.35)",
      };
    if (retention >= 50)
      return {
        background: "rgba(249,226,175,0.2)",
        border: "1px solid rgba(249,226,175,0.35)",
      };
    if (retention >= 30)
      return {
        background: "rgba(250,179,135,0.2)",
        border: "1px solid rgba(250,179,135,0.35)",
      };
    return {
      background: "rgba(243,139,168,0.2)",
      border: "1px solid rgba(243,139,168,0.35)",
    };
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Fila do Dia
      </h2>

      {queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Calendar size={20} color="var(--text-muted)" />
          </div>
          <p style={{ color: "var(--text-sub)", margin: 0, fontWeight: 500 }}>
            Nenhum card para revisar hoje!
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Adicione novos cards ou volte amanhã.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {queue.map((card) => (
          <div
            key={card.id}
            style={{
              borderRadius: "12px",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              ...getRecallStyle(card.predicted_recall),
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                marginRight: "12px",
              }}
            >
              {card.front}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "13px",
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text)",
                flexShrink: 0,
              }}
            >
              {card.predicted_recall}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
