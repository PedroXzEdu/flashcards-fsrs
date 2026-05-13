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

  function getRecallColor(retention: number) {
    if (retention >= 80) return "bg-green-200";
    if (retention >= 50) return "bg-yellow-200";
    if (retention >= 30) return "bg-orange-300";
    return "bg-red-300";
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Daily Queue</h2>

      {queue.length === 0 && <p>No cards for today!</p>}

      {queue.map((card) => (
        <div
          key={card.id}
          className={`
      rounded-xl
      shadow
      p-4
      flex
      justify-between
      ${getRecallColor(card.predicted_recall)}
    `}
        >
          <span>{card.front}</span>
          <span className="font-semibold">{card.predicted_recall}%</span>
        </div>
      ))}
    </div>
  );
}
