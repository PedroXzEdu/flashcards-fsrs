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
import CalendarHeatmap from "react-calendar-heatmap";

import {
  getRetentionRate,
  getForgettingCurve,
  getHeatmap,
  getPredictedRecall,
  getDailyQueue,
} from "../services/analyticsApi";

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
    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

    {/* Top Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold">Retention Rate</h2>
        <p className="text-4xl font-bold mt-4">{retention?.retention_rate}%</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold">Successful Reviews</h2>
        <p className="text-4xl font-bold mt-4">{retention?.successful_reviews}</p>
      </div>
    </div>

    {/* Forgetting Curve */}
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Forgetting Curve</h2>
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
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Review Heatmap</h2>
      <CalendarHeatmap
        startDate={new Date("2026-01-01")}
        endDate={new Date()}
        values={heatmap}
        classForValue={(value) => {
          if (!value) return "color-empty";
          return color-scale-${Math.min(value.reviews, 4)};
        }}
      />
    </div>

    {/* Weakest Cards */}
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Weakest Cards</h2>
      <div className="space-y-4">
        {recall?.sort((a,b) => a.predicted_recall - b.predicted_recall)
          .slice(0,5)
          .map(card => (
            <div key={card.card_id} className="flex justify-between items-center border-b pb-2">
              <p>{card.front}</p>
              <strong>{card.predicted_recall}%</strong>
            </div>
          ))}
      </div>
    </div>

    {/* Daily Queue */}
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Daily Queue</h2>
      <div className="space-y-4">
        {dailyQueue?.map(card => (
          <div key={card.id} className={`
            rounded-xl
            shadow
            p-4
            flex
            justify-between
            ${getRecallColor(card.predicted_recall)}
          `}>
            <span>{card.front}</span>
            <span className="font-semibold">{card.predicted_recall}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}
