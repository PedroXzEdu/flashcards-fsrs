import { useEffect, useState } from "react";
import { api } from "../api/client";

interface ActivityDay {
  day: string;
  count: string;
}

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getColor(count: number): string {
  if (count === 0) return "var(--bg-hover)";
  if (count <= 5) return "rgba(203,166,247,0.3)";
  if (count <= 15) return "rgba(203,166,247,0.55)";
  if (count <= 30) return "rgba(203,166,247,0.8)";
  return "var(--accent)";
}

function getLast365Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function ActivityHeatmap() {
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    api
      .get<{ activity: ActivityDay[] }>("/review-logs/activity")
      .then((data) => {
        const map: Record<string, number> = {};
        data.activity.forEach((d) => {
          map[d.day.slice(0, 10)] = Number(d.count);
        });
        setActivityMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const days = getLast365Days();

  // Padding inicial para alinhar com dia da semana
  const firstDayOfWeek = days[0].getDay();
  const paddedDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  // Agrupa em semanas (colunas)
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // Labels dos meses
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIndex) => {
    const firstReal = week.find((d) => d !== null);
    if (firstReal) {
      const month = firstReal.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], col: colIndex });
        lastMonth = month;
      }
    }
  });

  const totalReviews = Object.values(activityMap).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(activityMap).length;

  if (loading)
    return (
      <div
        className="skeleton"
        style={{ height: "120px", borderRadius: "12px" }}
      />
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Atividade — últimos 365 dias
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
          <span
            style={{
              color: "var(--text)",
              fontWeight: 600,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {totalReviews}
          </span>{" "}
          revisões em{" "}
          <span
            style={{
              color: "var(--text)",
              fontWeight: 600,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {activeDays}
          </span>{" "}
          dias
        </p>
      </div>

      <div style={{ position: "relative" }}>
        {/* Labels dos dias da semana */}
        <div
          style={{
            display: "flex",
            gap: "3px",
            marginBottom: "4px",
            paddingLeft: "28px",
          }}
        >
          {monthLabels.map((m) => (
            <div
              key={`${m.label}-${m.col}`}
              style={{
                position: "absolute",
                left: `${28 + m.col * 13}px`,
                fontSize: "10px",
                color: "var(--text-muted)",
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "2px", marginTop: "16px" }}>
          {/* Labels dias da semana */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginRight: "4px",
            }}
          >
            {DAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  height: "11px",
                  fontSize: "9px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  visibility: i % 2 === 0 ? "visible" : "hidden",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: "2px" }}>
            {weeks.map((week, wi) => (
              <div
                key={wi}
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {week.map((day, di) => {
                  if (!day)
                    return (
                      <div key={di} style={{ width: "11px", height: "11px" }} />
                    );
                  const key = day.toISOString().slice(0, 10);
                  const count = activityMap[key] ?? 0;
                  const isToday = key === new Date().toISOString().slice(0, 10);
                  return (
                    <div
                      key={di}
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "2px",
                        background: getColor(count),
                        outline: isToday ? "1px solid var(--accent)" : "none",
                        cursor: count > 0 ? "pointer" : "default",
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          text:
                            count > 0
                              ? `${count} revisões em ${day.toLocaleDateString("pt-BR")}`
                              : `Sem revisões em ${day.toLocaleDateString("pt-BR")}`,
                        });
                        (e.currentTarget as HTMLElement).style.transform =
                          "scale(1.3)";
                      }}
                      onMouseLeave={(e) => {
                        setTooltip(null);
                        (e.currentTarget as HTMLElement).style.transform =
                          "scale(1)";
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              color: "var(--text-sub)",
              whiteSpace: "nowrap",
              zIndex: 9999,
              pointerEvents: "none",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "8px",
          justifyContent: "flex-end",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
          Menos
        </span>
        {[0, 5, 15, 30, 31].map((v) => (
          <div
            key={v}
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "2px",
              background: getColor(v),
            }}
          />
        ))}
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
          Mais
        </span>
      </div>
    </div>
  );
}
