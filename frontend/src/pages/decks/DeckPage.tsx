import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decksApi } from "../../api/decks";
import { cardsApi } from "../../api/cards";
import type { Deck, Card } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import Layout from "../../components/Layout";
import EmptyState from "../../components/EmptyState";
import ConfirmModal from "../../components/ConfirmModal";
import { SkeletonCardItem } from "../../components/SkeletonCard";
import CardListItem from "../../components/CardListItem";
import LoadMoreButton from "../../components/LoadMoreButton";
import Button from "../../components/Button";
import CardForm from "../../components/CardForm";
import BulkCreateForm from "../../components/BulkCreateForm";
import CsvImportModal from "../../components/CsvImportModal";
import ShareModal from "../../components/ShareModal";
import {
  BarChart2,
  FileText,
  ListPlus,
  Play,
  Pencil,
  Plus,
  Settings,
  Search,
  Share2,
  MoreVertical,
  FileSpreadsheet,
} from "lucide-react";

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newCardsPerDay, setNewCardsPerDay] = useState(20);
  const [requestRetention, setRequestRetention] = useState(0.9);
  const [maxInterval, setMaxInterval] = useState(36500);
  const [enableFuzz, setEnableFuzz] = useState(false);
  const [enableShortTerm, setEnableShortTerm] = useState(true);
  const [learningSteps, setLearningSteps] = useState("1m,10m");
  const [relearningSteps, setRelearningSteps] = useState("10m");
  const [loadingFsrsParams, setLoadingFsrsParams] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [search, setSearch] = useState("");
  const filteredCards = cards.filter(
    (card) =>
      search === "" ||
      card.front.toLowerCase().includes(search.toLowerCase()) ||
      card.back.toLowerCase().includes(search.toLowerCase()),
  );
  const [showBulk, setShowBulk] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const toast = useToast();
  const [renaming, setRenaming] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (showForm) setShowForm(false);
      if (showBulk) setShowBulk(false);
      if (showSettings) setShowSettings(false);
      if (editingTitle) setEditingTitle(false);
      if (showMoreMenu) setShowMoreMenu(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showForm, showBulk, showSettings, editingTitle, showMoreMenu]);

  const loadData = useCallback(async () => {
    try {
      const [deckData, cardsData, reviewData] = await Promise.all([
        decksApi.get(deckId),
        cardsApi.list(deckId, 1, 20),
        cardsApi.forReview(deckId),
      ]);
      setDeck(deckData);
      setNewCardsPerDay(deckData.new_cards_per_day ?? 20);
      setCards(cardsData.cards);
      setPage(1);
      setHasMore(cardsData.pagination.page < cardsData.pagination.totalPages);
      setDueCount(reviewData.total);
    } catch {
      setError("Erro ao carregar baralho.");
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await cardsApi.list(deckId, nextPage, 20);
      setCards((prev) => [...prev, ...data.cards]);
      setPage(nextPage);
      setHasMore(nextPage < data.pagination.totalPages);
    } catch {
      toast.error("Erro ao carregar mais cards.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- padrão de data fetching controlado
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (showSettings) {
      loadFsrsParams();
    }
  }, [showSettings]);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setRenaming(true);
    try {
      const updated = await decksApi.update(
        deckId,
        newTitle,
        newDescription,
        deck?.is_public ?? false,
      );
      setDeck(updated);
      setEditingTitle(false);
      toast.success("Baralho renomeado.");
    } catch {
      setError("Erro ao renomear baralho.");
      toast.error("Erro ao renomear baralho.");
    } finally {
      setRenaming(false);
    }
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await decksApi.updateSettings(deckId, {
        new_cards_per_day: newCardsPerDay,
        request_retention: requestRetention,
        maximum_interval: maxInterval,
        enable_fuzz: enableFuzz,
        enable_short_term: enableShortTerm,
        learning_steps: learningSteps,
        relearning_steps: relearningSteps,
      });
      setShowSettings(false);
      toast.success("Configurações salvas.");
    } catch {
      setError("Erro ao salvar configurações.");
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function loadFsrsParams() {
    setLoadingFsrsParams(true);
    try {
      const params = await decksApi.getFsrsParams(deckId);
      if (params) {
        setRequestRetention(params.request_retention);
        setMaxInterval(params.maximum_interval);
        setEnableFuzz(params.enable_fuzz);
        setEnableShortTerm(params.enable_short_term);
        setLearningSteps(params.learning_steps);
        setRelearningSteps(params.relearning_steps);
      }
    } catch {
      // usa defaults
    } finally {
      setLoadingFsrsParams(false);
    }
  }

  async function handleSave(front: string, back: string) {
    setSaving(true);
    try {
      if (editingCard) {
        const updated = await cardsApi.update(
          deckId,
          editingCard.id,
          front,
          back,
        );
        setCards((p) => p.map((c) => (c.id === updated.id ? updated : c)));
        setEditingCard(null);
      } else {
        const card = await cardsApi.create(deckId, front, back);
        setCards((p) => [card, ...p]);
      }
      setShowForm(false);
      toast.success("Card salvo");
    } catch {
      setError("Erro ao salvar card.");
      toast.error("Erro ao salvar card.");
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkCreate(pairs: { front: string; back: string }[]) {
    if (pairs.length === 0) {
      setError("Nenhum par válido encontrado. Use o formato: frente | verso");
      return;
    }
    setBulkSaving(true);
    try {
      const created = await cardsApi.createBatch(deckId, pairs);
      setCards((prev) => [...created, ...prev]);
      toast.success("Cards criados");
      setShowBulk(false);
    } catch {
      setError("Erro ao criar cards em lote.");
      toast.error("Erro ao criar cards em lote.");
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleDelete(card: Card) {
    setDeleting(true);
    try {
      await cardsApi.delete(deckId, card.id);
      setCards((p) => p.filter((c) => c.id !== card.id));
      toast.success("Card excluído");
      setConfirmDelete(null);
    } catch {
      setError("Erro ao excluir.");
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(card: Card) {
    setEditingCard(card);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingCard(null);
  }

  const dropdownItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "none",
    color: "var(--text-sub)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "Outfit, sans-serif",
    textAlign: "left" as const,
    transition: "background 0.1s",
  };

  if (loading)
    return (
      <Layout backTo="/" title={editingTitle ? undefined : deck?.title}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCardItem key={i} />
          ))}
        </div>
      </Layout>
    );

  return (
    <Layout
      backTo="/"
      title={deck?.title}
      actions={
        <>
          {/* Desktop: all buttons visible */}
          <div
            className="desktop-header-actions"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <button
              type="button"
              aria-label="Compartilhar baralho"
              onClick={() => setShowShare(true)}
              title="Compartilhar baralho"
              style={{
                background: deck?.share_token
                  ? "rgba(203,166,247,0.12)"
                  : "var(--bg-card)",
                border: `1px solid ${deck?.share_token ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "8px",
                cursor: "pointer",
                padding: "7px 9px",
                display: "flex",
                alignItems: "center",
                color: deck?.share_token ? "var(--accent)" : "var(--text-sub)",
                transition: "all 0.15s ease",
              }}
            >
              <Share2 size={14} />
            </button>
            <button
              type="button"
              aria-label="Renomear baralho"
              onClick={() => {
                setNewTitle(deck?.title ?? "");
                setNewDescription(deck?.description ?? "");
                setEditingTitle((s) => !s);
              }}
              title="Renomear baralho"
              style={{
                background: editingTitle ? "var(--bg-hover)" : "var(--bg-card)",
                border: `1px solid ${editingTitle ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "8px",
                cursor: "pointer",
                padding: "7px 9px",
                display: "flex",
                alignItems: "center",
                color: editingTitle ? "var(--accent)" : "var(--text-sub)",
                transition: "all 0.15s ease",
              }}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              aria-label="Configurações do baralho"
              onClick={() => setShowSettings((s) => !s)}
              title="Configurações do baralho"
              style={{
                background: showSettings ? "var(--bg-hover)" : "var(--bg-card)",
                border: `1px solid ${showSettings ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "8px",
                cursor: "pointer",
                padding: "7px 9px",
                display: "flex",
                alignItems: "center",
                color: showSettings ? "var(--accent)" : "var(--text-sub)",
                transition: "all 0.15s ease",
              }}
            >
              <Settings size={14} />
            </button>

            <Button
              variant="secondary"
              size="sm"
              icon={<BarChart2 size={13} />}
              onClick={() => navigate(`/decks/${deckId}/stats`)}
            >
              <span className="action-label">Stats</span>
            </Button>
            {dueCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={13} />}
                onClick={() => navigate(`/decks/${deckId}/review`)}
              >
                <span className="action-label">Revisar</span>
                <span
                  style={{
                    background: "var(--bg)",
                    color: "var(--accent)",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    padding: "1px 6px",
                    marginLeft: "4px",
                  }}
                >
                  {dueCount}
                </span>
              </Button>
            )}
          </div>

          {/* Mobile: compact actions row — Revisar + More menu */}
          <div
            className="mobile-header-actions"
            style={{ display: "none", gap: "4px", alignItems: "center" }}
          >
            {dueCount > 0 && (
              <button
                type="button"
                onClick={() => navigate(`/decks/${deckId}/review`)}
                title="Revisar"
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  padding: "7px 9px",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--bg)",
                  transition: "all 0.15s ease",
                }}
              >
                <Play size={14} />
              </button>
            )}
            <div ref={moreRef} style={{ position: "relative" }}>
              <button
                type="button"
                aria-label="Mais"
                aria-expanded={showMoreMenu}
                aria-haspopup="menu"
                onClick={() => setShowMoreMenu((s) => !s)}
                title="Mais"
                style={{
                  background: showMoreMenu
                    ? "var(--bg-hover)"
                    : "var(--bg-card)",
                  border: `1px solid ${showMoreMenu ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  padding: "7px 9px",
                  display: "flex",
                  alignItems: "center",
                  color: showMoreMenu ? "var(--accent)" : "var(--text-sub)",
                  transition: "all 0.15s ease",
                }}
              >
                <MoreVertical size={14} />
              </button>
              {showMoreMenu && (
                <div
                  className="mobile-more-dropdown"
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "6px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow)",
                    minWidth: "170px",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowShare(true);
                      setShowMoreMenu(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Share2 size={14} /> Compartilhar
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setNewTitle(deck?.title ?? "");
                      setNewDescription(deck?.description ?? "");
                      setEditingTitle((s) => !s);
                      setShowMoreMenu(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Pencil size={14} /> Renomear
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowSettings((s) => !s);
                      setShowMoreMenu(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Settings size={14} /> Configurações
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      navigate(`/decks/${deckId}/stats`);
                      setShowMoreMenu(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <BarChart2 size={14} /> Stats
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      }
    >
      {confirmDelete !== null && (
        <ConfirmModal
          title="Excluir card"
          message={
            <>
              Tem certeza que deseja excluir o card abaixo? O histórico de
              revisões também será removido.
              <br />
              <br />
              <strong>Frente:</strong>{" "}
              {confirmDelete.front.replace(/<[^>]*>/g, "").substring(0, 120)}
            </>
          }
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />
      )}

      {showShare && deck && (
        <ShareModal
          deck={deck}
          onClose={() => setShowShare(false)}
          onUpdate={setDeck}
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
            onClick={loadData}
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

      {showSettings && (
        <div
          className="animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Settings size={14} /> Configurações do baralho
          </h2>

          {loadingFsrsParams ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Carregando...
            </p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Cards novos por dia
                  </label>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Quantos cards novos o FSRS introduz por dia neste baralho.
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={newCardsPerDay}
                      onChange={(e) => setNewCardsPerDay(Number(e.target.value))}
                      style={{
                        width: "80px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--accent)",
                        outline: "none",
                        fontFamily: "JetBrains Mono, monospace",
                        textAlign: "center",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--accent)")
                      }
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      cards novos por dia
                    </span>
                  </div>
                </div>
              </div>

              <hr style={{
                margin: "20px 0",
                border: "none",
                borderTop: "1px solid var(--border)",
              }} />

              <h3 style={{
                margin: "0 0 12px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
              }}>
                Parâmetros FSRS
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Retenção desejada
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={0.99}
                    step={0.05}
                    value={requestRetention}
                    onChange={(e) => setRequestRetention(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: "var(--text)",
                      outline: "none",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Intervalo máximo (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={36500}
                    value={maxInterval}
                    onChange={(e) => setMaxInterval(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: "var(--text)",
                      outline: "none",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Passos de aprendizado
                  </label>
                  <input
                    type="text"
                    value={learningSteps}
                    onChange={(e) => setLearningSteps(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: "var(--text)",
                      outline: "none",
                      fontFamily: "Outfit, sans-serif",
                    }}
                    placeholder="1m,10m"
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Passos de re-aprendizado
                  </label>
                  <input
                    type="text"
                    value={relearningSteps}
                    onChange={(e) => setRelearningSteps(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: "var(--text)",
                      outline: "none",
                      fontFamily: "Outfit, sans-serif",
                    }}
                    placeholder="10m"
                  />
                </div>
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    cursor: "pointer",
                  }}>
                    <input
                      type="checkbox"
                      checked={enableFuzz}
                      onChange={(e) => setEnableFuzz(e.target.checked)}
                    />
                    Habilitar fuzz
                  </label>
                </div>
                <div>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    cursor: "pointer",
                  }}>
                    <input
                      type="checkbox"
                      checked={enableShortTerm}
                      onChange={(e) => setEnableShortTerm(e.target.checked)}
                    />
                    Passos de curto prazo
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "16px", textAlign: "right" }}>
                <Button
                  size="sm"
                  loading={settingsSaving}
                  onClick={handleSaveSettings}
                >
                  Salvar
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {editingTitle && (
        <form
          onSubmit={handleRename}
          className="animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Pencil size={14} /> Renomear baralho
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título do baralho"
              required
              autoFocus
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "14px",
                color: "var(--text)",
                outline: "none",
                fontFamily: "Outfit, sans-serif",
                width: "100%",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "14px",
                color: "var(--text)",
                outline: "none",
                fontFamily: "Outfit, sans-serif",
                width: "100%",
                resize: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <Button type="submit" size="sm" loading={renaming}>
              Salvar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setEditingTitle(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          rowGap: "8px",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
          {cards.length} {cards.length === 1 ? "card" : "cards"}
          {dueCount > 0 && (
            <span
              style={{
                color: "var(--accent)",
                marginLeft: "8px",
                fontWeight: 500,
              }}
            >
              · {dueCount} para revisar
            </span>
          )}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            margin: "0 16px",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
            <Search
              size={13}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cards..."
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "7px 12px 7px 30px",
                fontSize: "13px",
                color: "var(--text)",
                outline: "none",
                fontFamily: "Outfit, sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<FileSpreadsheet size={13} />}
          onClick={() => setShowCsvImport(true)}
          style={{ marginRight: "8px" }}
        >
          Importar
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={<ListPlus size={13} />}
          onClick={() => setShowBulk((s) => !s)}
          style={{ marginRight: "12px" }}
        >
          Em lote
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} />}
          onClick={() => setShowForm(true)}
        >
          Novo card
        </Button>
      </div>

      {showForm && (
        <CardForm
          initialValues={
            editingCard
              ? { front: editingCard.front, back: editingCard.back }
              : undefined
          }
          onSave={handleSave}
          onCancel={cancelForm}
          saving={saving}
          editMode={editingCard !== null}
        />
      )}

      {showBulk && (
        <BulkCreateForm
          onSave={handleBulkCreate}
          onCancel={() => setShowBulk(false)}
          saving={bulkSaving}
        />
      )}

      {showCsvImport && (
        <CsvImportModal
          deckId={deckId}
          onClose={() => setShowCsvImport(false)}
          onSuccess={loadData}
        />
      )}

      {cards.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} color="var(--text-muted)" />}
          title="Nenhum card ainda."
          description="Adicione seu primeiro card!"
        />
      ) : search !== "" && filteredCards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p
            style={{
              color: "var(--text-sub)",
              margin: 0,
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Nenhum card encontrado para sua busca.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredCards.map((card, i) => (
            <CardListItem
              key={card.id}
              card={card}
              index={i}
              onEdit={handleEdit}
              onDelete={(c) => setConfirmDelete(c)}
            />
          ))}
          {hasMore && (
            <LoadMoreButton onClick={loadMore} loading={loadingMore} />
          )}
        </div>
      )}
      <style>{`
        @media (max-width: 480px) {
          .card-form-grid { grid-template-columns: 1fr !important; }
          .desktop-header-actions { display: none !important; }
          .mobile-header-actions { display: flex !important; }
          .mobile-more-dropdown button:hover { background: var(--bg-hover) !important; color: var(--text) !important; }
        }
      `}</style>
    </Layout>
  );
}
