import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon, Layers } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      login(res.user, res.token);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
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
        type="button"
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
            Crie sua conta
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {[
            {
              label: "Nome",
              type: "text",
              value: name,
              setter: setName,
              placeholder: "Seu nome",
            },
            {
              label: "E-mail",
              type: "email",
              value: email,
              setter: setEmail,
              placeholder: "seu@email.com",
            },
            {
              label: "Senha",
              type: "password",
              value: password,
              setter: setPassword,
              placeholder: "••••••••",
            },
          ].map((field) => (
            <div key={field.label}>
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
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          ))}

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
              transition: "opacity 0.2s",
              fontFamily: "Outfit, sans-serif",
              marginTop: "4px",
            }}
          >
            {loading ? "Cadastrando..." : "Criar conta"}
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
          Já tem conta?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
