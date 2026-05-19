import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decksApi } from "../../api/decks";
import type { DeckStats } from "../../types";
import Layout from "../../components/Layout";
import { SkeletonDeckCard } from "../../components/SkeletonCard";
import ActivityHeatmap from "../../components/ActivityHeatmap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deckId = Number(id);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    decksApi
      .stats(deckId)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [deckId]);

  if (loading)
    return (
      <Layout backTo={`/decks/${deckId}`} title="Estatísticas">
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

  const { cards, reviews } = stats;
  const retention = Number(reviews.retention_rate) || 0;

  const retentionColor =
    retention >= 90
      ? "var(--success)"
      : retention >= 75
        ? "var(--warning)"
        : "var(--danger)";

  const stateData = [
    { name: "Novos", value: Number(cards.new_cards), fill: "var(--info)" },
    {
      name: "Aprendendo",
      value: Number(cards.learning),
      fill: "var(--warning)",
    },
    { name: "Revisão", value: Number(cards.reviewing), fill: "var(--success)" },
    {
      name: "Reaprendendo",
      value: Number(cards.lapses ?? 0),
      fill: "var(--danger)",
    },
  ].filter((d) => d.value > 0);

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

  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <Layout backTo={`/decks/${deckId}`} title="Estatísticas">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Resumo */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Total de cards",
              value: cards.total,
              color: "var(--text)",
            },
            {
              label: "Para revisar hoje",
              value: cards.due_today,
              color: "var(--accent)",
            },
            {
              label: "Dificuldade média",
              value: Number(cards.avg_difficulty).toFixed(2),
              color: "var(--warning)",
            },
            {
              label: "Estabilidade média",
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

        {/* Retenção */}
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
            Taxa de Retenção
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "48px",
                  fontWeight: 700,
                  color: retentionColor,
                  letterSpacing: "-1px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {retention > 0 ? `${retention}%` : "—"}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}
              >
                de acertos
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "13px",
                  color: "var(--text-sub)",
                }}
              >
                Total de revisões:{" "}
                <span style={{ color: "var(--text)", fontWeight: 600 }}>
                  {reviews.total_reviews}
                </span>
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                {retention >= 90
                  ? "🟢 Excelente! Acima da meta do FSRS (90%)."
                  : retention >= 75
                    ? "🟡 Boa retenção, continue assim."
                    : retention > 0
                      ? "🔴 Retenção baixa. Revise com mais frequência!"
                      : "Faça sua primeira revisão para ver a taxa."}
              </p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div
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
              Estado dos Cards
            </p>
            {stateData.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                Nenhum card ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stateData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} cards`, ""]} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
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
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detalhamento */}
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
            Detalhamento
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              textAlign: "center",
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
                label: "Total rev.",
                value: reviews.total_reviews,
                color: "var(--accent)",
                bg: "rgba(203,166,247,0.1)",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.bg,
                  borderRadius: "12px",
                  padding: "16px 8px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "22px",
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
        <div style={{ ...cardStyle, overflow: "visible" }}>
          <ActivityHeatmap />
        </div>
      </div>
    </Layout>
  );
}
