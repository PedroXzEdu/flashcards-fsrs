import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { Card } from "../types";

interface CardInlineEditProps {
  card: Card;
  onSave: (cardId: number, front: string, back: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function CardInlineEdit({
  card,
  onSave,
  onCancel,
  saving,
}: CardInlineEditProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    frontRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel, saving]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    await onSave(card.id, front.trim(), back.trim());
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "13px",
    color: "var(--text)",
    outline: "none",
    fontFamily: "Outfit, sans-serif",
    resize: "vertical",
    transition: "border-color 0.2s",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--accent)",
        borderRadius: "12px",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "8px" }}>
        <textarea
          ref={frontRef}
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Frente"
          required
          rows={2}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Verso"
          required
          rows={2}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "6px",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "none",
            color: "var(--text-muted)",
            fontSize: "12px",
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Outfit, sans-serif",
            opacity: saving ? 0.5 : 1,
          }}
        >
          <X size={12} />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            background: "var(--accent)",
            color: "var(--bg)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Outfit, sans-serif",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            "Salvando..."
          ) : (
            <>
              <Check size={12} />
              Salvar
            </>
          )}
        </button>
      </div>
    </form>
  );
}
