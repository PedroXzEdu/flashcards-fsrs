import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decksApi } from "../../api/decks";
import { cardsApi } from "../../api/cards";
import type { Deck } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { SkeletonDeckCard } from "../../components/SkeletonCard";
import ImportModal from "../../components/ImportModal";
import Button from "../../components/Button";
import { DailyQueue } from "../../components/DailyQueue";
import { statsApi } from "../../api/decks";
import { getWorkloadForecast } from "../../services/analyticsApi";
import type { WorkloadForecastDay } from "../../services/analyticsApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  Trash2,
  BookOpen,
  Download,
  Flame,
  Trophy,
  Calendar,
} from "lucide-react";

function fillWorkloadDays(
  data: WorkloadForecastDay[],
  days: number,
): (WorkloadForecastDay & { label: string })[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dataMap = new Map<string, WorkloadForecastDay>();
  for (const d of data) {
    dataMap.set(d.day, d);
  }

  const result: (WorkloadForecastDay & { label: string })[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayStr = `${year}-${month}-${day}`;
    const existing = dataMap.get(dayStr);
    result.push({
      day: dayStr,
      review_cards: existing?.review_cards ?? 0,
      new_cards: existing?.new_cards ?? 0,
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }

  return result;
}

type WorkloadTooltipProps = {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
};

function WorkloadTooltip({ active, payload, label }: WorkloadTooltipProps) {
  if (!active || !payload?.length) return null;
  const review = payload.find((p) => p.dataKey === "review_cards")?.value ?? 0;
  const newCards = payload.find((p) => p.dataKey === "new_cards")?.value ?? 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
        {label}
      </p>
      {review + newCards === 0 ? (
        <p style={{ margin: "2px 0 0", color: "var(--text-muted)" }}>
          Nenhuma revisão prevista
        </p>
      ) : (
        <>
          <p style={{ margin: "2px 0 0", color: "var(--accent)" }}>
            Revisões: {review}
          </p>
          <p style={{ margin: 0, color: "var(--info)" }}>Novos: {newCards}</p>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [dueCounts, setDueCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Deck | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [streak, setStreak] = useState({
    streak: 0,
    longest: 0,
    total_days: 0,
  });
  const [workload, setWorkload] = useState<WorkloadForecastDay[]>([]);
  const [workloadDays, setWorkloadDays] = useState(30);
  const [workloadLoading, setWorkloadLoading] = useState(false);
  const [workloadError, setWorkloadError] = useState(false);
  const toast = useToast();

  const filledWorkload = fillWorkloadDays(workload, workloadDays);
  const allWorkloadZero = filledWorkload.every(
    (d) => d.review_cards === 0 && d.new_cards === 0,
  );
  const workloadTickInterval =
    workloadDays <= 7 ? 0 : workloadDays <= 14 ? 1 : 4;

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "n" && !showForm && !showImport) setShowForm(true);
      if (e.key === "i" && !showImport && !showForm) setShowImport(true);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showForm, showImport]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkload() {
      setWorkloadLoading(true);
      setWorkloadError(false);
      try {
        const data = await getWorkloadForecast(workloadDays);
        if (!cancelled) setWorkload(data);
      } catch {
        if (!cancelled) setWorkloadError(true);
      } finally {
        if (!cancelled) setWorkloadLoading(false);
      }
    }

    loadWorkload();

    return () => {
      cancelled = true;
    };
  }, [workloadDays]);

  async function loadDecks() {
    try {
      const data = await decksApi.list();
      setDecks(data);
      // Carrega contagem de revisões por baralho
      const counts: Record<number, number> = {};
      const streakData = await statsApi.streak();
      setStreak(streakData);
      await Promise.all(
        data.map(async (deck) => {
          try {
            const r = await cardsApi.forReview(deck.id);
            counts[deck.id] = r.total;
          } catch {
            counts[deck.id] = 0;
          }
        }),
      );
      setDueCounts(counts);
    } catch {
      setError("Erro ao carregar baralhos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const deck = await decksApi.create(title, description, false);
      setDecks((p) => [deck, ...p]);
      toast.success("Baralho criado");
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch {
      setError("Erro ao criar baralho.");
      toast.error("Erro ao criar baralho.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(deck: Deck) {
    setDeleting(true);
    try {
      await decksApi.delete(deck.id);
      setDecks((p) => p.filter((d) => d.id !== deck.id));
      toast.success("Baralho excluído");
      setConfirmDelete(null);
    } catch {
      setError("Erro ao excluir.");
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
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
    fontFamily: "Outfit, sans-serif",
    transition: "border-color 0.2s",
  };

  return (
    <Layout
      actions={
        <div className="header-actions" style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={13} />}
            onClick={() => setShowImport(true)}
          >
            <span className="action-label">Importar .apkg</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => setShowForm(true)}
          >
            <span className="action-label">Novo baralho</span>
          </Button>
        </div>
      }
    >
      {confirmDelete && (
        <ConfirmModal
          title="Excluir baralho"
          message={`Tem certeza que deseja excluir "${confirmDelete.title}"? Todos os cards e histórico serão perdidos.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={loadDecks}
        />
      )}

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
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadDecks}
            style={{
              background: "none",
              border: "1px solid var(--danger)",
              borderRadius: "6px",
              color: "var(--danger)",
              padding: "4px 10px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.4px",
          }}
        >
          Meus Baralhos
        </h1>
        {streak.streak > 0 || streak.total_days > 0 ? (
          <div
            className="animate-fade-in dashboard-streak-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                icon: (
                  <Flame
                    size={18}
                    color={
                      streak.streak > 0 ? "var(--danger)" : "var(--text-muted)"
                    }
                  />
                ),
                label: "Sequência atual",
                value: `${streak.streak} ${streak.streak === 1 ? "dia" : "dias"}`,
                color:
                  streak.streak > 0 ? "var(--danger)" : "var(--text-muted)",
                bg:
                  streak.streak > 0
                    ? "rgba(243,139,168,0.08)"
                    : "var(--bg-card)",
                border:
                  streak.streak > 0 ? "rgba(243,139,168,0.3)" : "var(--border)",
              },
              {
                icon: <Trophy size={18} color="var(--warning)" />,
                label: "Maior sequência",
                value: `${streak.longest} ${streak.longest === 1 ? "dia" : "dias"}`,
                color: "var(--warning)",
                bg: "rgba(249,226,175,0.08)",
                border: "rgba(249,226,175,0.3)",
              },
              {
                icon: <Calendar size={18} color="var(--info)" />,
                label: "Dias estudados",
                value: `${streak.total_days} ${streak.total_days === 1 ? "dia" : "dias"}`,
                color: "var(--info)",
                bg: "rgba(137,180,250,0.08)",
                border: "rgba(137,180,250,0.3)",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: item.color,
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "1px",
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="animate-fade-in"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                margin: 0,
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Complete sua primeira revisão para iniciar sua sequência!
            </p>
          </div>
        )}
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          {decks.length} {decks.length === 1 ? "baralho" : "baralhos"}
        </p>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            Novo baralho
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do baralho"
              required
              autoFocus
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              style={{ ...inputStyle, resize: "none" } as React.CSSProperties}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Criar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDescription("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div
          className="deck-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <SkeletonDeckCard key={i} />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <BookOpen size={28} color="var(--text-muted)" />
          </div>
          <p style={{ color: "var(--text-sub)", margin: 0, fontWeight: 500 }}>
            Nenhum baralho ainda.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Crie seu primeiro baralho para começar!
          </p>
        </div>
      ) : (
        <div
          className="deck-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {decks.map((deck, i) => {
            const due = dueCounts[deck.id] ?? 0;
            return (
              <div
                key={deck.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${i * 50}ms`,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "var(--shadow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/decks/${deck.id}`)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {deck.title}
                      </h2>
                      {due > 0 && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "10px",
                            background: "var(--accent)",
                            color: "var(--bg)",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {due} hoje
                        </span>
                      )}
                    </div>
                    {deck.description && (
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                        }}
                      >
                        {deck.description}
                      </p>
                    )}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--accent)",
                        background: "rgba(203,166,247,0.1)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontWeight: 500,
                      }}
                    >
                      {deck.card_count}{" "}
                      {Number(deck.card_count) === 1 ? "card" : "cards"}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Excluir baralho"
                    onClick={() => setConfirmDelete(deck)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      marginLeft: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--danger)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "28px", marginBottom: "16px" }}>
        <DailyQueue />
      </div>

      <div
        className="animate-fade-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Previsão de Revisões
          </h2>
          <div style={{ display: "flex", gap: "4px" }}>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setWorkloadDays(d)}
                style={{
                  background:
                    workloadDays === d ? "var(--accent)" : "var(--bg)",
                  color: workloadDays === d ? "var(--bg)" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {workloadLoading ? (
          <div
            style={{
              height: "140px",
              borderRadius: "10px",
              background: "var(--bg)",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ) : workloadError ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Não foi possível carregar a previsão.
            </p>
          </div>
        ) : workload.length === 0 || allWorkloadZero ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Nenhuma revisão prevista para este período.
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                margin: "6px 0 0",
              }}
            >
              Os cards ainda não foram agendados ou não há revisões pendentes.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={filledWorkload} barCategoryGap="10%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={workloadTickInterval}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<WorkloadTooltip />} />
              <Bar
                dataKey="review_cards"
                name="Revisões"
                fill="var(--accent)"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="new_cards"
                name="Novos"
                fill="var(--info)"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dashboard-streak-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .deck-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important; }
          .header-actions .action-label { display: none; }
          .header-actions { gap: 4px !important; }
        }
      `}</style>
    </Layout>
  );
}
