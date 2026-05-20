import { useState, useEffect } from "react";
import { statsApi } from "../api/decks";
import type { GlobalStats } from "../types";
import Layout from "../components/Layout";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { SkeletonDeckCard } from "../components/SkeletonCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const RATING_COLORS = [
  "var(--danger)",
  "var(--warning)",
  "var(--success)",
  "var(--info)",
];

export default function StatsGlobalPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi
      .globalStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
  };

  if (loading)
    return (
      <Layout backTo="/" title="Estatísticas Globais">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <SkeletonDeckCard key={i} />
          ))}
        </div>
      </Layout>
    );

  if (!stats) return null;

  const { cards, reviews, decks, daily } = stats;
  const retention = Number(reviews.retention_rate) || 0;
  const retentionColor =
    retention >= 90
      ? "var(--success)"
      : retention >= 75
        ? "var(--warning)"
        : "var(--danger)";

  const dailyData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    total: Number(d.total),
  }));

  const ratingData = [
    {
      name: "De novo",
      value: Number(reviews.again_count),
      fill: "var(--danger)",
    },
    {
      name: "Difícil",
      value: Number(reviews.hard_count),
      fill: "var(--warning)",
    },
    { name: "Bom", value: Number(reviews.good_count), fill: "var(--success)" },
    { name: "Fácil", value: Number(reviews.easy_count), fill: "var(--info)" },
  ];

  return (
    <Layout backTo="/" title="Estatísticas Globais">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Resumo geral */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Baralhos",
              value: decks.total_decks,
              color: "var(--accent)",
            },
            {
              label: "Total de cards",
              value: cards.total_cards,
              color: "var(--text)",
            },
            {
              label: "Para revisar",
              value: cards.due_today,
              color: "var(--warning)",
            },
            {
              label: "Total revisões",
              value: reviews.total_reviews,
              color: "var(--info)",
            },
            {
              label: "Retenção",
              value: retention > 0 ? `${retention}%` : "—",
              color: retentionColor,
            },
            {
              label: "Estabilidade",
              value: `${Number(cards.avg_stability).toFixed(1)}d`,
              color: "var(--success)",
            },
          ].map((item) => (
            <div key={item.label} style={cardStyle}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: item.color,
                  letterSpacing: "-0.5px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Gráfico de revisões diárias */}
        <div style={cardStyle}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Revisões — últimos 30 dias
          </p>
          {dailyData.length === 0 ? (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              Nenhuma revisão ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--accent)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor(dailyData.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`${v} revisões`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribuição de respostas + Estado dos cards */}
        <div
          className="stats-charts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={cardStyle}>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Distribuição de Respostas
            </p>
            {Number(reviews.total_reviews) === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                Nenhuma revisão ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ratingData} barCategoryGap="30%">
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" name="Revisões" radius={[6, 6, 0, 0]}>
                    {ratingData.map((entry, i) => (
                      <Cell key={i} fill={RATING_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={cardStyle}>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Estado dos Cards
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {[
                {
                  label: "Novos",
                  value: cards.new_cards,
                  color: "var(--info)",
                  bg: "rgba(137,180,250,0.1)",
                },
                {
                  label: "Aprendendo",
                  value: cards.learning,
                  color: "var(--warning)",
                  bg: "rgba(249,226,175,0.1)",
                },
                {
                  label: "Em revisão",
                  value: cards.reviewing,
                  color: "var(--success)",
                  bg: "rgba(166,227,161,0.1)",
                },
                {
                  label: "Dif. média",
                  value: Number(cards.avg_difficulty).toFixed(2),
                  color: "var(--accent)",
                  bg: "rgba(203,166,247,0.1)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: item.bg,
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: item.color,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ ...cardStyle, overflow: "visible" }}>
          <ActivityHeatmap />
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .stats-charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
