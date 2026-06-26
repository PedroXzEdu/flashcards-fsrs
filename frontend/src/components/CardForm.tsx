import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import Button from "./Button";

interface CardFormProps {
  initialValues?: { front: string; back: string; tags?: string[] };
  onSave: (front: string, back: string, tags?: string[]) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  editMode: boolean;
}

export default function CardForm({
  initialValues,
  onSave,
  onCancel,
  saving,
  editMode,
}: CardFormProps) {
  const [front, setFront] = useState(initialValues?.front ?? "");
  const [back, setBack] = useState(initialValues?.back ?? "");
  const [tagsInput, setTagsInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("saving");
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave(front, back, tags.length > 0 ? tags : undefined);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(null), 2000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "20px",
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
        {editMode ? "Editar card" : "Novo card"}
      </h2>
      <div
        className="card-form-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: "6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Frente
          </label>
          <RichTextEditor
            content={front}
            onChange={setFront}
            placeholder="Pergunta ou conceito..."
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: "6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Verso
          </label>
          <RichTextEditor
            content={back}
            onChange={setBack}
            placeholder="Resposta ou definição..."
          />
        </div>
      </div>
      <div style={{ marginTop: "12px" }}>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--text-muted)",
            marginBottom: "6px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Tags (separadas por vírgula)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="ex: biologia, célula, dna"
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            color: "var(--text)",
            outline: "none",
            fontFamily: "Outfit, sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
          alignItems: "center",
        }}
      >
        <Button type="submit" size="sm" loading={saving}>
          {saving ? "Salvando..." : editMode ? "Salvar" : "Criar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        {saveStatus === "saved" && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--success)",
              fontWeight: 500,
              animation: "fadeIn 0.2s ease",
            }}
          >
            Salvo ✓
          </span>
        )}
      </div>
    </form>
  );
}
