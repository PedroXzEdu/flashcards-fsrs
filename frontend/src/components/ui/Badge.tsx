import type { ReactNode } from "react";

interface BadgeProps {
  variant: "new" | "learning" | "review" | "relearning";
  children?: ReactNode;
}

const variantStyles: Record<
  BadgeProps["variant"],
  { color: string; bg: string }
> = {
  new: { color: "var(--info)", bg: "rgba(137,180,250,0.12)" },
  learning: { color: "var(--warning)", bg: "rgba(249,226,175,0.12)" },
  review: { color: "var(--success)", bg: "rgba(166,227,161,0.12)" },
  relearning: { color: "var(--danger)", bg: "rgba(243,139,168,0.12)" },
};

export default function Badge({ variant, children }: BadgeProps) {
  const s = variantStyles[variant];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "6px",
        color: s.color,
        background: s.bg,
        whiteSpace: "nowrap",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      {children ?? variant}
    </span>
  );
}
