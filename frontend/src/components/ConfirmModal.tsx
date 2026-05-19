import { useEffect } from "react";
import Button from "./Button";
import { Trash2, X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
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
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(243,139,168,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={18} color="var(--danger)" />
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "13px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={onConfirm}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
