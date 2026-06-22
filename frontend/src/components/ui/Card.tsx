import type { ReactNode } from "react";

interface CardProps {
  variant?: "default" | "elevated";
  padding?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const variantStyles = {
  default: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  elevated: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
};

export default function Card({
  variant = "default",
  padding = "20px",
  children,
  style,
  className,
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        borderRadius: "16px",
        padding,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
