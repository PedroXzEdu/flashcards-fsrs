import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  getRetentionRate,
  getForgettingCurve,
  getHeatmap,
  getPredictedRecall,
  getDailyQueue,
} from "../services/analyticsApi";

function getRecallStyle(recall: number) {
  if (recall < 50) return { background: "rgba(243,139,168,0.15)", border: "1px solid rgba(243,139,168,0.3)" };
  if (recall < 80) return { background: "rgba(249,226,175,0.15)", border: "1px solid rgba(249,226,175,0.3)" };
  return { background: "rgba(166,227,161,0.15)", border: "1px solid rgba(166,227,161,0.3)" };
}

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow)",
  padding: "24px",
};

export function AnalyticsPage() {
  const [retention, setRetention] = useState<any>(null);
  const [curve, setCurve] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [recall, setRecall] = useState<any[]>([]);
  const [dailyQueue, setDailyQueue] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      const retentionData = await getRetentionRate();
      const curveData = await getForgettingCurve();
      const heatmapData = await getHeatmap();
      const recallData = await getPredictedRecall();
      const dailyQueueData = await getDailyQueue();

      setRetention(retentionData);
      setCurve(curveData.curve);
      setHeatmap(heatmapData);
      setRecall(recallData);
      setDailyQueue(dailyQueueData);
    }

    loadAnalytics();
  }, []);

  return (
  <div className="p-8 space-y-8">
    <h1 className="text-3xl font-bold">Painel de Análises</h1>

    {/* Top Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div style={cardStyle}>
        <h2 className="text-lg font-semibold">Taxa de Retenção</h2>
        <p className="text-4xl font-bold mt-4">{retention?.retention_rate}%</p>
      </div>

      <div style={cardStyle}>
        <h2 className="text-lg font-semibold">Revisões Concluídas</h2>
        <p className="text-4xl font-bold mt-4">{retention?.successful_reviews}</p>
      </div>
    </div>

    {/* Forgetting Curve */}
    <div style={cardStyle}>
      <h2 className="text-xl font-semibold mb-6">Curva de Esquecimento</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={curve}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="retention" />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Heatmap */}
    <div style={cardStyle}>
      <h2 className="text-xl font-semibold mb-6">Mapa de Revisões</h2>
      <div className="grid grid-cols-7 gap-2">
        {heatmap.map((day) => (
          <div
            key={day.day}
            className="rounded p-2 text-center text-xs"
            style={{ background: "rgba(203,166,247,0.2)" }}
            title={`${day.reviews} revisões`}
          >
            {day.reviews}
          </div>
        ))}
      </div>
    </div>

    {/* Weakest Cards */}
    <div style={cardStyle}>
      <h2 className="text-xl font-semibold mb-6">Cartões Mais Fracos</h2>
      <div className="space-y-4">
        {recall?.sort((a,b) => a.predicted_recall - b.predicted_recall)
          .slice(0,5)
          .map(card => (
            <div key={card.card_id} className="flex justify-between items-center border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <p>{card.front}</p>
              <strong>{card.predicted_recall}%</strong>
            </div>
          ))}
      </div>
    </div>

    {/* Daily Queue */}
    <div style={cardStyle}>
      <h2 className="text-xl font-semibold mb-6">Fila do Dia</h2>
      <div className="space-y-4">
        {dailyQueue?.map(card => (
          <div key={card.id} className="rounded-xl shadow p-4 flex justify-between" style={getRecallStyle(card.predicted_recall)}>
            <span>{card.front}</span>
            <span className="font-semibold">{card.predicted_recall}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}
