import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WorkloadForecastDay } from "../../services/analyticsApi";

function fillWorkloadDays(
  data: WorkloadForecastDay[],
  days: number,
): (WorkloadForecastDay & { label: string })[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dataMap = new Map<string, WorkloadForecastDay>();
  for (const d of data) {
    dataMap.set(d.day, d);
  }

  const result: (WorkloadForecastDay & { label: string })[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayStr = `${year}-${month}-${day}`;
    const existing = dataMap.get(dayStr);
    result.push({
      day: dayStr,
      review_cards: existing?.review_cards ?? 0,
      new_cards: existing?.new_cards ?? 0,
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }

  return result;
}

type WorkloadTooltipProps = {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
};

function WorkloadTooltip({ active, payload, label }: WorkloadTooltipProps) {
  if (!active || !payload?.length) return null;
  const review = payload.find((p) => p.dataKey === "review_cards")?.value ?? 0;
  const newCards = payload.find((p) => p.dataKey === "new_cards")?.value ?? 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
        {label}
      </p>
      {review + newCards === 0 ? (
        <p style={{ margin: "2px 0 0", color: "var(--text-muted)" }}>
          Nenhuma revisão prevista
        </p>
      ) : (
        <>
          <p style={{ margin: "2px 0 0", color: "var(--accent)" }}>
            Revisões: {review}
          </p>
          <p style={{ margin: 0, color: "var(--info)" }}>Novos: {newCards}</p>
        </>
      )}
    </div>
  );
}

interface WorkloadChartProps {
  workload: WorkloadForecastDay[];
  loading: boolean;
  error: boolean;
  days: number;
  onDaysChange: (days: number) => void;
}

export default function WorkloadChart({
  workload,
  loading,
  error,
  days,
  onDaysChange,
}: WorkloadChartProps) {
  const filledWorkload = fillWorkloadDays(workload, days);
  const allZero = filledWorkload.every(
    (d) => d.review_cards === 0 && d.new_cards === 0,
  );
  const tickInterval = days <= 7 ? 0 : days <= 14 ? 1 : 4;

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
          marginBottom: "10px",
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
          Previsão de Revisões
        </h2>
        <div style={{ display: "flex", gap: "4px" }}>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange(d)}
              style={{
                background:
                  days === d ? "var(--accent)" : "var(--bg)",
                color: days === d ? "var(--bg)" : "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            height: "140px",
            borderRadius: "10px",
            background: "var(--bg)",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ) : error ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Não foi possível carregar a previsão.
          </p>
        </div>
      ) : workload.length === 0 || allZero ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Nenhuma revisão prevista para este período.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              margin: "6px 0 0",
            }}
          >
            Os cards ainda não foram agendados ou não há revisões pendentes.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={filledWorkload} barCategoryGap="10%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<WorkloadTooltip />} />
            <Bar
              dataKey="review_cards"
              name="Revisões"
              fill="var(--accent)"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="new_cards"
              name="Novos"
              fill="var(--info)"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
