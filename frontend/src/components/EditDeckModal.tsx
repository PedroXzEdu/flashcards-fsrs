import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface DeckData {
  title: string;
  description: string | null;
}

interface EditDeckModalProps {
  deck: DeckData;
  onSave: (title: string, description: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function EditDeckModal({
  deck,
  onSave,
  onCancel,
  saving,
}: EditDeckModalProps) {
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    setTitle(deck.title);
    setDescription(deck.description ?? "");
  }, [deck]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel, saving]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(title.trim(), description.trim());
  }

  const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "var(--text)",
    outline: "none",
    fontFamily: "Outfit, sans-serif",
    transition: "border-color 0.2s",
  } as const;

  return (
    <div
      className="modal-overlay"
      onClick={!saving ? onCancel : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "24px",
      }}
    >
      <div
        ref={trapRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Renomear baralho
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={!saving ? onCancel : undefined}
            style={{
              background: "none",
              border: "none",
              cursor: !saving ? "pointer" : "not-allowed",
              color: "var(--text-muted)",
              padding: "4px",
              display: "flex",
              opacity: saving ? 0.4 : 1,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-sub)",
                marginBottom: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do baralho"
              required
              autoFocus
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-sub)",
                marginBottom: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={3}
              style={{
                ...inputStyle,
                resize: "none",
              } as React.CSSProperties}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
              marginTop: "8px",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
