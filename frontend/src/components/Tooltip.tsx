import { useState } from "react";

interface Props {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-alt)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            color: "var(--text-sub)",
            whiteSpace: "nowrap",
            zIndex: 50,
            pointerEvents: "none",
            boxShadow: "var(--shadow-sm)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
