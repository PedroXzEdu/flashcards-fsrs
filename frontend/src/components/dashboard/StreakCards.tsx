import { Flame, Trophy, Calendar } from "lucide-react";

interface StreakData {
  streak: number;
  longest: number;
  total_days: number;
}

interface StreakCardsProps {
  streak: StreakData;
}

export default function StreakCards({ streak }: StreakCardsProps) {
  if (streak.streak === 0 && streak.total_days === 0) {
    return (
      <div
        className="animate-fade-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          Complete sua primeira revisão para iniciar sua sequência!
        </p>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in dashboard-streak-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <StreakCard
        icon={
          <Flame
            size={18}
            color={streak.streak > 0 ? "var(--danger)" : "var(--text-muted)"}
          />
        }
        label="Sequência atual"
        value={`${streak.streak} ${streak.streak === 1 ? "dia" : "dias"}`}
        color={streak.streak > 0 ? "var(--danger)" : "var(--text-muted)"}
        bg={
          streak.streak > 0
            ? "rgba(243,139,168,0.08)"
            : "var(--bg-card)"
        }
        border={
          streak.streak > 0 ? "rgba(243,139,168,0.3)" : "var(--border)"
        }
      />
      <StreakCard
        icon={<Trophy size={18} color="var(--warning)" />}
        label="Maior sequência"
        value={`${streak.longest} ${streak.longest === 1 ? "dia" : "dias"}`}
        color="var(--warning)"
        bg="rgba(249,226,175,0.08)"
        border="rgba(249,226,175,0.3)"
      />
      <StreakCard
        icon={<Calendar size={18} color="var(--info)" />}
        label="Dias estudados"
        value={`${streak.total_days} ${streak.total_days === 1 ? "dia" : "dias"}`}
        color="var(--info)"
        bg="rgba(137,180,250,0.08)"
        border="rgba(137,180,250,0.3)"
      />
    </div>
  );
}

function StreakCard({
  icon,
  label,
  value,
  color,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "var(--bg-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color,
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "1px",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
