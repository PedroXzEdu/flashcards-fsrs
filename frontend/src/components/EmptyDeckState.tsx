import { FileText } from "lucide-react";
import Button from "./Button";

interface EmptyDeckStateProps {
  onCreateCard: () => void;
  onImportApkg?: () => void;
}

export default function EmptyDeckState({
  onCreateCard,
  onImportApkg,
}: EmptyDeckStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <FileText size={32} color="var(--text-muted)" />
      </div>
      <h2
        style={{
          margin: "0 0 4px",
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        Este baralho está vazio
      </h2>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: "13px",
          color: "var(--text-muted)",
          maxWidth: "320px",
          lineHeight: 1.6,
        }}
      >
        Adicione seu primeiro card para começar a revisar, ou importe cards de
        um arquivo.
      </p>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <Button variant="primary" size="md" onClick={onCreateCard}>
          Criar primeiro card
        </Button>
        {onImportApkg && (
          <Button variant="secondary" size="md" onClick={onImportApkg}>
            Importar .apkg
          </Button>
        )}
      </div>
    </div>
  );
}
