import { useState, useCallback } from "react";

export function useButton(baseStyle: React.CSSProperties) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
  };

  const style: React.CSSProperties = {
    ...baseStyle,
    transform: pressed ? "scale(0.96)" : hovered ? "scale(1.02)" : "scale(1)",
    transition:
      "transform 0.1s, opacity 0.15s, background 0.15s, border-color 0.15s, box-shadow 0.15s",
  };

  return { style, handlers };
}

export function useIconButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
  };

  return { hovered, pressed, handlers };
}
