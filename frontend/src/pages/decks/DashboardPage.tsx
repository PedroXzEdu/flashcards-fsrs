import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decksApi, statsApi } from "../../api/decks";
import { cardsApi } from "../../api/cards";
import type { Deck } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import ImportModal from "../../components/ImportModal";
import Button from "../../components/Button";
import { DailyQueue } from "../../components/DailyQueue";
import { getWorkloadForecast } from "../../services/analyticsApi";
import type { WorkloadForecastDay } from "../../services/analyticsApi";
import StreakCards from "../../components/dashboard/StreakCards";
import WorkloadChart from "../../components/dashboard/WorkloadChart";
import DeckList from "../../components/dashboard/DeckList";
import CreateDeckForm from "../../components/dashboard/CreateDeckForm";
import { Download, Plus } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [dueCounts, setDueCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Deck | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [streak, setStreak] = useState({ streak: 0, longest: 0, total_days: 0 });
  const [workload, setWorkload] = useState<WorkloadForecastDay[]>([]);
  const [workloadDays, setWorkloadDays] = useState(30);
  const [workloadLoading, setWorkloadLoading] = useState(false);
  const [workloadError, setWorkloadError] = useState(false);
  const toast = useToast();

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
      const [data, streakData, dueCountsData] = await Promise.all([
        decksApi.list(),
        statsApi.streak(),
        cardsApi.dueCounts(),
      ]);
      setDecks(data);
      setStreak(streakData);
      const counts: Record<number, number> = {};
      for (const item of dueCountsData) {
        counts[item.deck_id] = item.due_count;
      }
      setDueCounts(counts);
    } catch (err) {
      console.error("DashboardPage — loadDecks erro:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar baralhos.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(title: string, description: string) {
    setSaving(true);
    try {
      const deck = await decksApi.create(title, description, false);
      setDecks((p) => [deck, ...p]);
      toast.success("Baralho criado");
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
          <Button variant="danger" size="sm" onClick={loadDecks}>
            Tentar novamente
          </Button>
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

        <StreakCards streak={streak} />

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
        <CreateDeckForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      <DeckList
        decks={decks}
        dueCounts={dueCounts}
        loading={loading}
        onNavigate={(deckId) => navigate(`/decks/${deckId}`)}
        onDelete={(deck) => setConfirmDelete(deck)}
      />

      <div style={{ marginTop: "28px", marginBottom: "16px" }}>
        <DailyQueue />
      </div>

      <WorkloadChart
        workload={workload}
        loading={workloadLoading}
        error={workloadError}
        days={workloadDays}
        onDaysChange={setWorkloadDays}
      />

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
