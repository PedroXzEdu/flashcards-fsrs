import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decksApi } from "../../api/decks";
import { cardsApi } from "../../api/cards";
import type { Deck, Card } from "../../types";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { SkeletonCardItem } from "../../components/SkeletonCard";
import CardContent from "../../components/CardContent";
import Button from "../../components/Button";
import ShareModal from "../../components/ShareModal";
import RichTextEditor from "../../components/RichTextEditor";
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
  Trash2,
  MoreVertical,
} from "lucide-react";

const STATE = [
  { label: "Novo", color: "var(--info)", bg: "rgba(137,180,250,0.12)" },
  {
    label: "Aprendendo",
    color: "var(--warning)",
    bg: "rgba(249,226,175,0.12)",
  },
  { label: "Revisão", color: "var(--success)", bg: "rgba(166,227,161,0.12)" },
  {
    label: "Reaprendendo",
    color: "var(--danger)",
    bg: "rgba(243,139,168,0.12)",
  },
];

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newCardsPerDay, setNewCardsPerDay] = useState(20);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
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

  const loadData = useCallback(async () => {
    try {
      const [deckData, cardsData, reviewData] = await Promise.all([
        decksApi.get(deckId),
        cardsApi.list(deckId),
        cardsApi.forReview(deckId),
      ]);
      setDeck(deckData);
      setNewCardsPerDay(deckData.new_cards_per_day ?? 20);
      setCards(cardsData);
      setDueCount(reviewData.total);
    } catch {
      setError("Erro ao carregar baralho.");
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const updated = await decksApi.update(
        deckId,
        newTitle,
        newDescription,
        deck?.is_public ?? false,
      );
      setDeck(updated);
      setEditingTitle(false);
    } catch {
      setError("Erro ao renomear baralho.");
    }
  }

  async function handleSaveSettings() {
    try {
      await decksApi.updateSettings(deckId, newCardsPerDay);
      setShowSettings(false);
    } catch {
      setError("Erro ao salvar configurações.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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
      setFront("");
      setBack("");
      setShowForm(false);
    } catch {
      setError("Erro ao salvar card.");
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkCreate(e: React.FormEvent) {
    e.preventDefault();
    setBulkSaving(true);
    try {
      const lines = bulkText.split("\n").filter((l) => l.trim());
      const pairs = lines
        .map((l) => {
          const sep = l.includes("\t") ? "\t" : "|";
          const [front, ...rest] = l.split(sep);
          return { front: front?.trim(), back: rest.join(sep).trim() };
        })
        .filter((p) => p.front && p.back);

      if (pairs.length === 0) {
        setError("Nenhum par válido encontrado. Use o formato: frente | verso");
        return;
      }

      const created = await Promise.all(
        pairs.map((p) => cardsApi.create(deckId, p.front, p.back)),
      );
      setCards((prev) => [...created, ...prev]);
      setBulkText("");
      setShowBulk(false);
    } catch {
      setError("Erro ao criar cards em lote.");
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleDelete(cardId: number) {
    try {
      await cardsApi.delete(deckId, cardId);
      setCards((p) => p.filter((c) => c.id !== cardId));
      setConfirmDelete(null);
    } catch {
      setError("Erro ao excluir.");
    }
  }

  function handleEdit(card: Card) {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingCard(null);
    setFront("");
    setBack("");
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
          message="Tem certeza que deseja excluir este card? O histórico de revisões também será removido."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
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
          }}
        >
          {error}
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
            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "8px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Salvar
            </button>
          </div>
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
            <button
              type="submit"
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "8px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditingTitle(false)}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-muted)",
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Cancelar
            </button>
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
        <form
          onSubmit={handleSave}
          className="animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
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
            {editingCard ? "Editar card" : "Novo card"}
          </h2>
          <div
            className="card-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Frente
              </label>
              <RichTextEditor
                content={front}
                onChange={setFront}
                placeholder="Pergunta ou conceito..."
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Verso
              </label>
              <RichTextEditor
                content={back}
                onChange={setBack}
                placeholder="Resposta ou definição..."
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "8px",
                color: "var(--bg)",
                fontWeight: 600,
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              {saving ? "Salvando..." : editingCard ? "Salvar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-muted)",
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {showBulk && (
        <form
          onSubmit={handleBulkCreate}
          className="animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ListPlus size={15} /> Criar cards em lote
          </h2>
          <p
            style={{
              margin: "0 0 14px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Uma linha por card. Separe frente e verso com{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "1px 5px",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              |
            </code>{" "}
            ou{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "1px 5px",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Tab
            </code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Hello | Olá\nGoodbye | Tchau\nThank you | Obrigado"}
            rows={6}
            required
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "var(--text)",
              outline: "none",
              fontFamily: "JetBrains Mono, monospace",
              resize: "vertical",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "12px",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {
                bulkText
                  .split("\n")
                  .filter((l) => l.includes("|") || l.includes("\t")).length
              }{" "}
              cards detectados
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowBulk(false);
                  setBulkText("");
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={bulkSaving}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--bg)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                  opacity: bulkSaving ? 0.7 : 1,
                }}
              >
                {bulkSaving ? "Criando..." : "Criar cards"}
              </button>
            </div>
          </div>
        </form>
      )}

      {cards.length === 0 ? (
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
            <FileText size={28} color="var(--text-muted)" />
          </div>
          <p style={{ color: "var(--text-sub)", margin: 0, fontWeight: 500 }}>
            Nenhum card ainda.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Adicione seu primeiro card!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {cards
            .filter(
              (card) =>
                search === "" ||
                card.front.toLowerCase().includes(search.toLowerCase()) ||
                card.back.toLowerCase().includes(search.toLowerCase()),
            )
            .map((card, i) => {
              const s = STATE[card.state] ?? STATE[0];
              return (
                <div
                  key={card.id}
                  className="animate-slide-in"
                  style={{
                    animationDelay: `${i * 30}ms`,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-sub)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      color: s.color,
                      background: s.bg,
                      whiteSpace: "nowrap",
                      minWidth: "80px",
                      textAlign: "center",
                    }}
                  >
                    {s.label}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CardContent
                      html={card.front}
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    />
                    <CardContent
                      html={card.back}
                      style={{
                        margin: "2px 0 0",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    />
                  </div>
                  {card.reps > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {card.reps} rev.
                    </span>
                  )}
                  <div style={{ display: "flex", gap: "4px" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Pencil size={13} />}
                      onClick={() => handleEdit(card)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => setConfirmDelete(card.id)}
                      style={{ color: "var(--danger)" }}
                    />
                  </div>
                </div>
              );
            })}
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
