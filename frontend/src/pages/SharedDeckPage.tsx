import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decksApi } from "../api/decks";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Layers, Sun, Moon, Download, LogIn } from "lucide-react";

export default function SharedDeckPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();

  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    card_count: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    decksApi
      .getSharedPreview(token)
      .then(setPreview)
      .catch(() => setError("Baralho não encontrado ou link inválido."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleImport() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/shared/${token}`);
      return;
    }
    setImporting(true);
    try {
      await decksApi.importShared(token!);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao importar.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Layers size={20} color="var(--accent)" />
          <span
            style={{
              fontWeight: 700,
              color: "var(--text)",
              fontSize: "16px",
              letterSpacing: "-0.3px",
            }}
          >
            FlashFSRS
          </span>
        </div>
        <button
          onClick={toggle}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            padding: "7px 9px",
            display: "flex",
            alignItems: "center",
            color: "var(--text-sub)",
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
        ) : error ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</p>
            <p style={{ color: "var(--text-sub)", fontWeight: 500 }}>{error}</p>
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "16px",
                background: "var(--accent)",
                border: "none",
                borderRadius: "8px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Ir para o início
            </button>
          </div>
        ) : done ? (
          <div
            className="animate-slide-up"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "var(--shadow)",
            }}
          >
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
              <Download size={24} color="var(--success)" />
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Baralho importado!
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              O baralho foi adicionado à sua conta com sucesso.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "10px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "12px 24px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Ver meus baralhos
            </button>
          </div>
        ) : (
          <div
            className="animate-slide-up"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(203,166,247,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Layers size={24} color="var(--accent)" />
            </div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text)",
                textAlign: "center",
              }}
            >
              {preview?.title}
            </h2>
            {preview?.description && (
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                {preview.description}
              </p>
            )}
            <div
              style={{
                background: "rgba(203,166,247,0.08)",
                border: "1px solid rgba(203,166,247,0.2)",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {preview?.card_count}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginLeft: "6px",
                }}
              >
                cards
              </span>
            </div>

            {!isAuthenticated && (
              <div
                style={{
                  background: "rgba(249,226,175,0.08)",
                  border: "1px solid rgba(249,226,175,0.2)",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                Você precisa estar logado para importar este baralho.
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing}
              style={{
                width: "100%",
                background: "var(--accent)",
                border: "none",
                borderRadius: "10px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "12px",
                cursor: importing ? "not-allowed" : "pointer",
                fontFamily: "Outfit, sans-serif",
                opacity: importing ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {!isAuthenticated ? (
                <>
                  <LogIn size={15} /> Entrar para importar
                </>
              ) : importing ? (
                "Importando..."
              ) : (
                <>
                  <Download size={15} /> Importar baralho
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
