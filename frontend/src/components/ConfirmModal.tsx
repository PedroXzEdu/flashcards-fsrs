import { useEffect } from "react";
import Button from "./Button";
import { Trash2, X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  buttonIcon?: React.ReactNode;
  loading?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Excluir",
  confirmVariant = "danger",
  icon = <Trash2 size={18} />,
  iconBg = "rgba(243,139,168,0.12)",
  iconColor = "var(--danger)",
  buttonIcon,
  loading = false,
}: Props) {
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel, loading]);

  return (
    <div
      className="modal-overlay"
      onClick={loading ? undefined : onCancel}
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
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon && <span style={{ color: iconColor }}>{icon}</span>}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={loading ? undefined : onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              opacity: loading ? 0.4 : 1,
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
            variant={confirmVariant}
            size="sm"
            icon={buttonIcon}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
