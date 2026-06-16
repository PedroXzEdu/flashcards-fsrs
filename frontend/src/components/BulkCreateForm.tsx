import { useState } from "react";
import { ListPlus } from "lucide-react";
import Button from "./Button";

interface BulkCreateFormProps {
  onSave: (pairs: { front: string; back: string }[]) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function parseBulkText(text: string): { front: string; back: string }[] {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      const sep = l.includes("\t") ? "\t" : "|";
      const [front, ...rest] = l.split(sep);
      return { front: front?.trim(), back: rest.join(sep).trim() };
    })
    .filter((p) => p.front && p.back);
}

export default function BulkCreateForm({
  onSave,
  onCancel,
  saving,
}: BulkCreateFormProps) {
  const [bulkText, setBulkText] = useState("");
  const detectedCount = bulkText
    .split("\n")
    .filter((l) => l.includes("|") || l.includes("\t")).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pairs = parseBulkText(bulkText);
    if (pairs.length === 0) return;
    await onSave(pairs);
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
          margin: "0 0 6px",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <ListPlus size={15} /> Criar cards em lote
      </h2>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        Uma linha por card. Separe frente e verso com{" "}
        <code
          style={{
            background: "var(--bg)",
            padding: "1px 5px",
            borderRadius: "4px",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          |
        </code>{" "}
        ou{" "}
        <code
          style={{
            background: "var(--bg)",
            padding: "1px 5px",
            borderRadius: "4px",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Tab
        </code>
      </p>
      <textarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        placeholder={"Hello | Olá\nGoodbye | Tchau\nThank you | Obrigado"}
        rows={6}
        required
        style={{
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "13px",
          color: "var(--text)",
          outline: "none",
          fontFamily: "JetBrains Mono, monospace",
          resize: "vertical",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {detectedCount} cards detectados
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              fontSize: "13px",
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Cancelar
          </button>
          <Button type="submit" size="sm" loading={saving}>
            {saving ? "Criando..." : "Criar cards"}
          </Button>
        </div>
      </div>
    </form>
  );
}
