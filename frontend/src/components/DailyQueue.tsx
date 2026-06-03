import { useEffect, useState } from "react";
import { getDailyQueue } from "../services/analyticsApi";
import { Calendar } from "lucide-react";
import { SkeletonQueueItem } from "./SkeletonCard";

interface DailyQueueCard {
  id: number;
  front: string;
  predicted_recall: number;
}

export function DailyQueue() {
  const [queue, setQueue] = useState<DailyQueueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQueue() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDailyQueue();
        if (!cancelled) setQueue(data);
      } catch {
        if (!cancelled) setError("Não foi possível carregar a fila do dia.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadQueue();

    return () => {
      cancelled = true;
    };
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

  const DISPLAY_LIMIT = 5;
  const visible = queue.slice(0, DISPLAY_LIMIT);
  const remaining = queue.length - DISPLAY_LIMIT;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Fila do Dia
        </h2>
        {queue.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {queue.length} card{queue.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonQueueItem key={i} />
          ))}
        </div>
      )}
      {error && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p
            style={{
              color: "var(--danger)",
              margin: 0,
              fontSize: "13px",
            }}
          >
            {error}
          </p>
        </div>
      )}
      {!loading && !error && queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Calendar size={16} color="var(--text-muted)" />
          </div>
          <p
            style={{
              color: "var(--text-sub)",
              margin: 0,
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Nenhum card para revisar hoje!
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              marginTop: "2px",
            }}
          >
            Adicione novos cards ou volte amanhã.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {visible.map((card) => (
          <div
            key={card.id}
            style={{
              borderRadius: "10px",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              ...getRecallStyle(card.predicted_recall),
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                marginRight: "10px",
              }}
            >
              {card.front}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "12px",
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

      {remaining > 0 && (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: "12px",
            color: "var(--warning)",
            fontWeight: 600,
          }}
        >
          +{remaining} card{remaining === 1 ? "" : "s"} em risco
        </p>
      )}
    </div>
  );
}
