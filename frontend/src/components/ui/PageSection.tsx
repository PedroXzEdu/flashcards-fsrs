import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageSection({
  title,
  actions,
  children,
}: PageSectionProps) {
  return (
    <div style={{ marginBottom: "28px" }}>
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: title ? "16px" : 0,
          }}
        >
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {title}
            </h2>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
