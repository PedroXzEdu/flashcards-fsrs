import { useEffect, useState } from "react";
import { getDailyQueue } from "../services/analyticsApi";

export function DailyQueue() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    async function loadQueue() {
      const data = await getDailyQueue();
      setQueue(data);
    }

    loadQueue();
  }, []);

  function getRecallStyle(retention: number) {
    if (retention >= 80) return { background: "rgba(166,227,161,0.2)", border: "1px solid rgba(166,227,161,0.35)" };
    if (retention >= 50) return { background: "rgba(249,226,175,0.2)", border: "1px solid rgba(249,226,175,0.35)" };
    if (retention >= 30) return { background: "rgba(250,179,135,0.2)", border: "1px solid rgba(250,179,135,0.35)" };
    return { background: "rgba(243,139,168,0.2)", border: "1px solid rgba(243,139,168,0.35)" };
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Fila do Dia</h2>

      {queue.length === 0 && <p>Sem cartões para hoje!</p>}

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
