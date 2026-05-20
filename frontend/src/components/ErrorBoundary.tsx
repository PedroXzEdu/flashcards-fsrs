import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "var(--bg)",
            color: "var(--text)",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "rgba(243,139,168,0.15)",
                border: "1px solid rgba(243,139,168,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "28px",
              }}
            >
              ⚠
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Algo deu errado
            </h1>
            <p
              style={{
                color: "var(--text-sub)",
                margin: "0 0 4px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <pre
                style={{
                  margin: "16px 0",
                  padding: "12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: "120px",
                  fontFamily: "JetBrains Mono, monospace",
                  lineHeight: 1.4,
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
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
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
