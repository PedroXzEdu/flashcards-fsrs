interface PasswordStrengthIndicatorProps {
  password: string;
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const labels = ["", "Fraca", "Média", "Forte", "Muito forte"];
const colors = ["var(--border)", "var(--danger)", "var(--warning)", "var(--success)", "var(--accent)"];

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getStrength(password);
  const color = colors[strength];
  const label = labels[strength];

  return (
    <div style={{ marginTop: "8px" }}>
      <div
        style={{
          height: "4px",
          background: "var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(strength / 4) * 100}%`,
            height: "100%",
            background: color,
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
        />
      </div>
      {password && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "11px",
            color,
            fontWeight: 500,
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
