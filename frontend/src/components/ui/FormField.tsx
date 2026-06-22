import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--text-muted)",
  marginBottom: "6px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--danger)",
            marginTop: "4px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
