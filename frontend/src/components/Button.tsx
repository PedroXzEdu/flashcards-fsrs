import { useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

const variants = {
  primary: {
    base: { background: "var(--accent)", color: "var(--bg)", border: "none" },
    hover: {
      background: "var(--accent-alt)",
      boxShadow: "0 0 0 3px rgba(203,166,247,0.25)",
    },
  },
  secondary: {
    base: {
      background: "none",
      color: "var(--text-sub)",
      border: "1px solid var(--border)",
    },
    hover: {
      background: "var(--bg-hover)",
      borderColor: "var(--accent)",
      color: "var(--text)",
    },
  },
  danger: {
    base: {
      background: "rgba(243,139,168,0.1)",
      color: "var(--danger)",
      border: "1px solid rgba(243,139,168,0.3)",
    },
    hover: {
      background: "rgba(243,139,168,0.2)",
      boxShadow: "0 0 0 3px rgba(243,139,168,0.15)",
    },
  },
  ghost: {
    base: { background: "none", color: "var(--text-muted)", border: "none" },
    hover: { background: "var(--bg-hover)", color: "var(--text)" },
  },
};

const sizes = {
  sm: {
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "7px",
    gap: "4px",
  },
  md: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "8px",
    gap: "6px",
  },
  lg: {
    padding: "11px 22px",
    fontSize: "14px",
    borderRadius: "10px",
    gap: "8px",
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        setHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        setPressed(false);
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        setPressed(true);
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setPressed(false);
        props.onMouseUp?.(e);
      }}
      style={{
        ...v.base,
        ...(hovered && !isDisabled ? v.hover : {}),
        ...s,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        transform:
          pressed && !isDisabled
            ? "scale(0.96)"
            : hovered && !isDisabled
              ? "translateY(-1px)"
              : "none",
        transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: "12px",
            height: "12px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            marginRight: children ? s.gap : 0,
            display: "inline-block",
          }}
        />
      ) : icon ? (
        <span
          style={{ display: "inline-flex", marginRight: children ? s.gap : 0 }}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
