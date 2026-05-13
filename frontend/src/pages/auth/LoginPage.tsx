import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon, Layers } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.user, res.token);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
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
    transition: "border-color 0.2s",
    fontFamily: "Outfit, sans-serif",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <button
        onClick={toggle}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
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

      <div
        className="animate-slide-up"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Layers
            size={36}
            color="var(--accent)"
            style={{ margin: "0 auto" }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.5px",
            }}
          >
            FlashFSRS
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            Entre na sua conta
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-sub)",
                marginBottom: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-sub)",
                marginBottom: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(243,139,168,0.1)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
                fontSize: "13px",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "10px",
              color: "var(--bg)",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s, transform 0.1s",
              fontFamily: "Outfit, sans-serif",
              marginTop: "4px",
            }}
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.opacity = "0.9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = loading ? "0.7" : "1")
            }
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "24px",
          }}
        >
          Não tem conta?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
