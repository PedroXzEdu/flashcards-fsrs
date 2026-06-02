import { useState, useEffect } from "react";
import { X, Link, Copy, Check, Trash2, Users } from "lucide-react";
import { decksApi } from "../api/decks";
import type { Deck } from "../types";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface Props {
  deck: Deck;
  onClose: () => void;
  onUpdate: (deck: Deck) => void;
}

export default function ShareModal({ deck, onClose, onUpdate }: Props) {
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(deck.share_token);
  const [showConfirm, setShowConfirm] = useState(false);

  const shareUrl = token ? `${window.location.origin}/shared/${token}` : null;

  async function handleShare() {
    setLoading(true);
    setError("");
    try {
      const res = await decksApi.share(deck.id);
      setToken(res.token);
      onUpdate({ ...deck, share_token: res.token });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao gerar link de compartilhamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleUnshare() {
    setShowConfirm(true);
  }

  async function handleConfirmUnshare() {
    setShowConfirm(false);
    setLoading(true);
    setError("");
    try {
      await decksApi.unshare(deck.id);
      setToken(null);
      onUpdate({ ...deck, share_token: null });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao desativar link de compartilhamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(203,166,247,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} color="var(--accent)" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                Compartilhar baralho
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {deck.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
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

        {error && (
          <div
            role="alert"
            style={{
              background: "rgba(243,139,168,0.1)",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              fontSize: "13px",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {token ? (
          <>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "var(--text-sub)",
              }}
            >
              Qualquer pessoa com este link pode importar uma cópia deste
              baralho:
            </p>

            {/* Link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "20px",
              }}
            >
              <Link
                size={13}
                color="var(--text-muted)"
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: "12px",
                  color: "var(--text-sub)",
                  fontFamily: "JetBrains Mono, monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copied
                    ? "rgba(166,227,161,0.15)"
                    : "var(--bg-hover)",
                  border: `1px solid ${copied ? "rgba(166,227,161,0.4)" : "var(--border)"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: "5px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: copied ? "var(--success)" : "var(--text-sub)",
                  fontFamily: "Outfit, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div
              style={{
                background: "rgba(249,226,175,0.08)",
                border: "1px solid rgba(249,226,175,0.2)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              ⚠️ Ao importar, o usuário recebe uma cópia independente do
              baralho. Alterações futuras não serão sincronizadas.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={handleUnshare}
                disabled={loading}
                style={{
                  background: "none",
                  border: "1px solid rgba(243,139,168,0.3)",
                  borderRadius: "8px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={13} /> Desativar link
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--bg)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                Feito
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "var(--text-sub)",
                lineHeight: 1.6,
              }}
            >
              Gere um link único para compartilhar este baralho. Qualquer pessoa
              com o link poderá importar uma cópia.
            </p>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 500,
                  color: "var(--text-sub)",
                }}
              >
                O que acontece ao compartilhar:
              </p>
              <p style={{ margin: 0 }}>
                ✓ Um link único é gerado para o baralho
              </p>
              <p style={{ margin: 0 }}>
                ✓ Qualquer pessoa pode importar uma cópia
              </p>
              <p style={{ margin: 0 }}>
                ✓ Você pode desativar o link a qualquer momento
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
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
              <Button
                type="button"
                size="md"
                icon={<Link size={13} />}
                loading={loading}
                onClick={handleShare}
              >
                {loading ? "Gerando..." : "Gerar link"}
              </Button>
            </div>
          </>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Desativar compartilhamento"
          message="Desativar o compartilhamento? O link atual deixará de funcionar."
          onConfirm={handleConfirmUnshare}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
