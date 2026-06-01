import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cardsApi } from "../../api/cards";
import type { Card, PreviewRatings } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { X, Sun, Moon, Check, RotateCcw, Shuffle } from "lucide-react";
import Tooltip from "../../components/Tooltip";
import CardContent from "../../components/CardContent";

const RATINGS = [
  {
    value: 1,
    label: "De novo",
    key: "again",
    color: "var(--danger)",
    bg: "rgba(243,139,168,0.12)",
    border: "rgba(243,139,168,0.4)",
    tooltip: "Não lembrei. Voltar ao início.",
  },
  {
    value: 2,
    label: "Difícil",
    key: "hard",
    color: "var(--warning)",
    bg: "rgba(249,226,175,0.12)",
    border: "rgba(249,226,175,0.4)",
    tooltip: "Lembrei com esforço. Intervalo curto.",
  },
  {
    value: 3,
    label: "Bom",
    key: "good",
    color: "var(--success)",
    bg: "rgba(166,227,161,0.12)",
    border: "rgba(166,227,161,0.4)",
    tooltip: "Lembrei bem. Intervalo normal.",
  },
  {
    value: 4,
    label: "Fácil",
    key: "easy",
    color: "var(--info)",
    bg: "rgba(137,180,250,0.12)",
    border: "rgba(137,180,250,0.4)",
    tooltip: "Muito fácil. Intervalo longo.",
  },
];

function formatDays(days: number) {
  if (days === 0) return "minutos";
  if (days === 1) return "amanhã";
  return `${days}d`;
}

function RatingButton({
  r,
  preview,
  submitting,
  onRate,
}: {
  r: (typeof RATINGS)[0];
  preview: PreviewRatings | null;
  submitting: boolean;
  onRate: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const days = preview?.[r.key as keyof PreviewRatings]?.scheduled_days ?? null;

  return (
    <Tooltip text={r.tooltip}>
      <button
        type="button"
        onClick={() => onRate(r.value)}
        disabled={submitting}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          width: "100%",
          background: r.bg,
          border: `1px solid ${hovered ? r.color : r.border}`,
          borderRadius: "14px",
          padding: "14px 8px",
          cursor: submitting ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          opacity: submitting ? 0.6 : 1,
          transform: pressed
            ? "scale(0.96)"
            : hovered
              ? "translateY(-2px)"
              : "none",
          boxShadow:
            hovered && !submitting ? `0 6px 16px rgba(0,0,0,0.2)` : "none",
          transition:
            "transform 120ms ease, background-color 150ms ease, box-shadow 150ms ease",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: r.color }}>
          {r.label}
        </span>
        {days !== null && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {formatDays(days)}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const deckId = Number(id);

  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [preview, setPreview] = useState<PreviewRatings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(0);
  const [history, setHistory] = useState<("correct" | "wrong")[]>([]);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignora se estiver digitando em algum input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (!flipped) {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          handleFlip();
        }
      } else {
        if (e.key === "1") handleRate(1);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(4);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, submitting, index]);

  async function loadCards() {
    try {
      const data = await cardsApi.forReview(deckId);
      setCards(shuffled ? shuffle(data.cards) : data.cards);
      if (data.cards.length === 0) setDone(true);
    } catch {
      navigate(`/decks/${deckId}`);
    } finally {
      setLoading(false);
    }
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function handleFlip() {
    if (flipped) return;
    setError("");
    setFlipped(true);
    try {
      setPreview(await cardsApi.preview(deckId, cards[index].id));
    } catch {
      /* preview opcional */
    }
  }

  async function handleRate(rating: number) {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await cardsApi.review(deckId, cards[index].id, rating);
      setHistory((h) => [...h, rating >= 3 ? "correct" : "wrong"]);
      setReviewed((r) => r + 1);
      const next = index + 1;
      if (next >= cards.length) {
        setDone(true);
      } else {
        setFlipped(false);
        setPreview(null);
        setTimeout(() => setIndex(next), 50);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar revisão. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>Carregando sessão...</p>
      </div>
    );

  if (done)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          className="animate-slide-up"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
            maxWidth: "420px",
            width: "100%",
            boxShadow: "var(--shadow)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "rgba(166,227,161,0.15)",
              border: "1px solid rgba(166,227,161,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Check size={28} color="var(--success)" />
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.4px",
            }}
          >
            Sessão concluída!
          </h1>
          <p
            style={{
              color: "var(--text-sub)",
              margin: "0 0 6px",
              fontSize: "14px",
            }}
          >
            Você revisou{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              {reviewed}
            </span>{" "}
            {reviewed === 1 ? "card" : "cards"} hoje.
          </p>

          {/* Histórico visual */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              justifyContent: "center",
              margin: "16px 0 24px",
              flexWrap: "wrap",
            }}
          >
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    h === "correct" ? "var(--success)" : "var(--danger)",
                }}
              />
            ))}
          </div>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              margin: "0 0 28px",
            }}
          >
            O FSRS agendou as próximas revisões automaticamente.
          </p>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "12px 24px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Ir para o início
            </button>
            <button
              type="button"
              onClick={() => navigate(`/decks/${deckId}`)}
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
              Voltar ao baralho
            </button>
          </div>
        </div>
      </div>
    );

  const card = cards[index];
  const progress = (index / cards.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
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
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/decks/${deckId}`)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "13px",
            padding: "7px 9px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          <X size={15} /> Encerrar
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Histórico inline */}
          <div
            style={{
              display: "flex",
              gap: "3px",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {cards.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background:
                    i < history.length
                      ? history[i] === "correct"
                        ? "var(--success)"
                        : "var(--danger)"
                      : i === index
                        ? "var(--accent)"
                        : "var(--border)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {index + 1} / {cards.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setShuffled((s) => !s);
              setCards((prev) =>
                shuffled
                  ? [...prev].sort((a, b) => a.id - b.id)
                  : shuffle(prev),
              );
            }}
            title="Embaralhar"
            style={{
              background: shuffled
                ? "rgba(203,166,247,0.15)"
                : "var(--bg-card)",
              border: `1px solid ${shuffled ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "6px",
              cursor: "pointer",
              padding: "5px 7px",
              display: "flex",
              alignItems: "center",
              color: shuffled ? "var(--accent)" : "var(--text-sub)",
            }}
          >
            <Shuffle size={13} />
          </button>
          <button
            type="button"
            onClick={toggle}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
              padding: "5px 7px",
              display: "flex",
              alignItems: "center",
              color: "var(--text-sub)",
            }}
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "var(--border)" }}>
        <div
          style={{
            height: "100%",
            background: "var(--accent)",
            width: `${progress}%`,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Card area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "640px" }}>
          {/* Flip card */}
          <div
            className="card-flip-container"
            style={{ marginBottom: "16px", minHeight: "280px" }}
          >
            <div
              className={`card-flip-inner ${flipped ? "flipped" : ""}`}
              style={{ minHeight: "280px" }}
            >
              {/* Frente */}
              <div
                className="card-face"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "48px 40px",
                  minHeight: "280px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
                onClick={handleFlip}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "20px",
                    fontWeight: 500,
                  }}
                >
                  FRENTE
                </span>
                <CardContent
                  html={card?.front ?? ""}
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 500,
                    color: "var(--text)",
                    textAlign: "center",
                  }}
                />
                {!flipped && (
                  <p
                    style={{
                      margin: "24px 0 0",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <RotateCcw size={11} /> Clique para virar
                  </p>
                )}
              </div>

              {/* Verso */}
              <div
                className="card-face card-face-back"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--accent)",
                  borderRadius: "20px",
                  padding: "48px 40px",
                  minHeight: "280px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 0 1px var(--accent), var(--shadow-sm)`,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "20px",
                    fontWeight: 500,
                  }}
                >
                  VERSO
                </span>
                <CardContent
                  html={card?.back ?? ""}
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    color: "var(--text-sub)",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-muted)",
              margin: "12px 0",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            pressione{" "}
            <kbd
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "10px",
              }}
            >
              1
            </kbd>{" "}
            <kbd
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "10px",
              }}
            >
              2
            </kbd>{" "}
            <kbd
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "10px",
              }}
            >
              3
            </kbd>{" "}
            <kbd
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "10px",
              }}
            >
              4
            </kbd>{" "}
            para avaliar ·{" "}
            <kbd
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "10px",
              }}
            >
              espaço
            </kbd>{" "}
            para virar
          </p>
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
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          {flipped && (
            <div
              className="animate-fade-in rating-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
              }}
            >
              {RATINGS.map((r) => (
                <RatingButton
                  key={r.value}
                  r={r}
                  preview={preview}
                  submitting={submitting}
                  onRate={handleRate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <style>{`
        @media (max-width: 480px) {
          .rating-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
