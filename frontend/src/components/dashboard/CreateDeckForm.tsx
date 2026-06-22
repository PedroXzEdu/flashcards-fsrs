import { useState, useRef, useEffect } from "react";
import Button from "../Button";

interface CreateDeckFormProps {
  onSave: (title: string, description: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function CreateDeckForm({
  onSave,
  onCancel,
  saving,
}: CreateDeckFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onCancel();
        setTitle("");
        setDescription("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(title, description);
    setTitle("");
    setDescription("");
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="animate-fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        Novo baralho
      </h2>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
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
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          rows={2}
          style={{ ...inputStyle, resize: "none" } as React.CSSProperties}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <Button type="submit" variant="primary" size="sm" loading={saving}>
          Criar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
