import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import {
  X,
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { importApi } from "../api/decks";
import { useToast } from "../contexts/ToastContext";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface Props {
  deckId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

interface ImportResult {
  deck: { id: number; title: string };
  imported: number;
  skipped: number;
  message: string;
}

export default function CsvImportModal({ deckId, onClose, onSuccess }: Props) {
  const trapRef = useFocusTrap(true);

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && status !== "loading") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, status]);

  function handleFile(file: File) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (ext !== ".csv" && ext !== ".txt") {
      setError("Apenas arquivos .csv e .txt são aceitos.");
      return;
    }
    setSelectedFile(file);
    setError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!selectedFile) {
      setError("Selecione um arquivo .csv ou .txt primeiro.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const data = await importApi.importCsvTxt(selectedFile, deckId);
      setResult(data);
      setStatus("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao importar.");
      toast.error(err instanceof Error ? err.message : "Erro ao importar.");
      setStatus("error");
    }
  }

  function handleFinish() {
    toast.success("Importação concluída");
    onSuccess();
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={status !== "loading" ? onClose : undefined}
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
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Importar arquivo
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              Importe cards de arquivos .csv ou .txt
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={status !== "loading" ? onClose : undefined}
            style={{
              background: "none",
              border: "none",
              cursor: status !== "loading" ? "pointer" : "not-allowed",
              color: "var(--text-muted)",
              padding: "4px",
              display: "flex",
              opacity: status === "loading" ? 0.4 : 1,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo por status */}
        {status === "idle" || status === "error" ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : selectedFile ? "var(--success)" : "var(--border)"}`,
                borderRadius: "14px",
                padding: "36px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                background: dragOver
                  ? "rgba(203,166,247,0.05)"
                  : selectedFile
                    ? "rgba(166,227,161,0.05)"
                    : "var(--bg)",
                marginBottom: "16px",
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {selectedFile ? (
                <>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(166,227,161,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <FileUp size={22} color="var(--success)" />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {selectedFile.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {(selectedFile.size / 1024).toFixed(0)} KB · Clique
                    para trocar
                  </p>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--bg-hover)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Upload size={22} color="var(--text-muted)" />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text)",
                    }}
                  >
                    Arraste o arquivo aqui
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    ou clique para selecionar · .csv ou .txt até 10MB
                  </p>
                </>
              )}
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(243,139,168,0.1)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Info */}
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 500,
                  color: "var(--text-sub)",
                }}
              >
                Formatos aceitos:
              </p>
              <p style={{ margin: 0 }}>
                <strong>.txt</strong> — Uma linha por card. Separe frente e verso
                com <code style={{ background: "var(--bg)", padding: "1px 4px", borderRadius: "4px" }}>|</code> ou{" "}
                <code style={{ background: "var(--bg)", padding: "1px 4px", borderRadius: "4px" }}>Tab</code>
              </p>
              <p style={{ margin: "4px 0 0" }}>
                <strong>.csv</strong> — Primeira coluna: frente, segunda coluna: verso.
                Primeira linha pode conter cabeçalho.
              </p>
              <p style={{ margin: "4px 0 0" }}>
                ✓ Os cards serão adicionados ao baralho atual
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="secondary" size="sm" onClick={handleImport}>
                Importar
              </Button>
            </div>
          </>
        ) : status === "loading" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(203,166,247,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                animation: "spin 1s linear infinite",
              }}
            >
              <Loader size={24} color="var(--accent)" />
            </div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              Importando...
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              Isso pode levar alguns segundos.
            </p>
          </div>
        ) : (
          // Success
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(166,227,161,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle size={26} color="var(--success)" />
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Importação concluída!
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              Cards importados com sucesso.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "rgba(166,227,161,0.1)",
                  border: "1px solid rgba(166,227,161,0.3)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--success)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {result?.imported}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  cards importados
                </p>
              </div>
              <div
                style={{
                  background: "rgba(249,226,175,0.1)",
                  border: "1px solid rgba(249,226,175,0.3)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--warning)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {result?.skipped}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  ignorados
                </p>
              </div>
            </div>

            <Button variant="primary" size="md" onClick={handleFinish}>
              Concluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}