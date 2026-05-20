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
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Fila do Dia</h2>

      {queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Calendar size={24} color="var(--text-muted)" />
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

      {queue.map((card) => (
        <div
          key={card.id}
          className="rounded-xl shadow p-4 flex justify-between"
          style={getRecallStyle(card.predicted_recall)}
        >
          <span>{card.front}</span>
          <span className="font-semibold">{card.predicted_recall}%</span>
        </div>
      ))}
    </div>
  );
}
