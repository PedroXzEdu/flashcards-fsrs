import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowLeft, BarChart2, Sun, Moon, LogOut, Layers } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  title?: string;
  actions?: React.ReactNode;
}

function HeaderButton({
  onClick,
  title,
  children,
  active,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => {
        setH(false);
        setP(false);
      }}
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      style={{
        background: active
          ? "var(--bg-hover)"
          : h
            ? "var(--bg-hover)"
            : "var(--bg-card)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "8px",
        cursor: "pointer",
        padding: "7px 9px",
        display: "flex",
        alignItems: "center",
        color: active ? "var(--accent)" : "var(--text-sub)",
        transform: p ? "scale(0.94)" : h ? "scale(1.04)" : "scale(1)",
        transition: "all 0.12s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {children}
    </button>
  );
}

export default function Layout({
  children,
  backTo,
  backLabel,
  title,
  actions,
}: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [backHover, setBackHover] = useState(false);
  const [backPressed, setBackPressed] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        className="app-header"
        style={{
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(8px)",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {backTo ? (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              onMouseEnter={() => setBackHover(true)}
              onMouseLeave={() => {
                setBackHover(false);
                setBackPressed(false);
              }}
              onMouseDown={() => setBackPressed(true)}
              onMouseUp={() => setBackPressed(false)}
              style={{
                background: backHover ? "var(--bg-hover)" : "none",
                border: "none",
                cursor: "pointer",
                color: backHover ? "var(--text)" : "var(--text-muted)",
                fontSize: "13px",
                padding: "5px 10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transform: backPressed
                  ? "scale(0.95) translateX(-2px)"
                  : backHover
                    ? "translateX(-2px)"
                    : "none",
                transition: "all 0.15s ease",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              <ArrowLeft size={14} />
              {backLabel || "Voltar"}
            </button>
          ) : (
            <div
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
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
          )}
          {!backTo && (
            <button
              type="button"
              onClick={() => navigate("/stats")}
              title="Estatísticas globais"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "13px",
                padding: "4px 10px",
                borderRadius: "8px",
                fontFamily: "Outfit, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <BarChart2 size={14} />{" "}
              <span className="stats-label">Estatísticas</span>
            </button>
          )}
          {title && (
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              / {title}
            </span>
          )}
        </div>

        <div
          className="app-header-right"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {actions}
          <HeaderButton
            onClick={toggle}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </HeaderButton>
          {user && (
            <>
              <span
                className="username-label"
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                }}
              >
                {user.name}
              </span>
              <HeaderButton onClick={logout} title="Sair">
                <LogOut size={15} />
              </HeaderButton>
            </>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px 24px",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
      <style>{`
        @media (max-width: 480px) {
          .username-label { display: none; }
          .stats-label { display: none; }
        }
        @media (max-width: 640px) {
          .app-header { min-height: 56px !important; height: auto !important; padding: 8px 12px !important; }
        }
      `}</style>
    </div>
  );
}
