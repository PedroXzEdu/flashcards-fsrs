import { useEffect, useCallback, useReducer, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cardsApi } from "../../api/cards";
import type { Card, PreviewRatings } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { LogOut, Check } from "lucide-react";
import ReviewHeader from "../../components/review/ReviewHeader";
import ReviewCard from "../../components/review/ReviewCard";
import ReviewSessionProgress from "../../components/review/ReviewSessionProgress";
import RatingButtons from "../../components/review/RatingButtons";
import ReviewSessionSummary from "../../components/review/ReviewSessionSummary";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import { SkeletonReviewCard } from "../../components/SkeletonCard";
import { useToast } from "../../contexts/ToastContext";

interface ReviewState {
  cards: Card[];
  index: number;
  flipped: boolean;
  preview: PreviewRatings | null;
  loading: boolean;
  submitting: boolean;
  done: boolean;
  error: string;
  reviewed: number;
  history: ("correct" | "wrong")[];
  shuffled: boolean;
  showExitConfirm: boolean;
}

type ReviewAction =
  | { type: "LOAD_CARDS"; cards: Card[] }
  | { type: "FLIP" }
  | { type: "SET_PREVIEW"; preview: PreviewRatings }
  | { type: "RATE"; rating: number }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_SUBMITTING"; submitting: boolean }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "REORDER_CARDS"; cards: Card[] }
  | { type: "SET_EXIT_CONFIRM"; show: boolean };

function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case "LOAD_CARDS":
      return { ...state, cards: action.cards, loading: false, done: action.cards.length === 0 };
    case "FLIP":
      return { ...state, flipped: true, error: "" };
    case "SET_PREVIEW":
      return { ...state, preview: action.preview };
    case "RATE": {
      const newHistory: ("correct" | "wrong")[] = [...state.history, action.rating >= 3 ? "correct" : "wrong"];
      const nextIndex = state.index + 1;
      const isDone = nextIndex >= state.cards.length;
      return {
        ...state,
        history: newHistory,
        reviewed: state.reviewed + 1,
        submitting: false,
        ...(isDone
          ? { done: true }
          : { flipped: false, preview: null, index: nextIndex }
        ),
      };
    }
    case "SET_ERROR":
      return { ...state, error: action.error, submitting: false };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.submitting };
    case "TOGGLE_SHUFFLE":
      return { ...state, shuffled: !state.shuffled };
    case "REORDER_CARDS":
      return { ...state, cards: action.cards };
    case "SET_EXIT_CONFIRM":
      return { ...state, showExitConfirm: action.show };
  }
}

const initialState: ReviewState = {
  cards: [],
  index: 0,
  flipped: false,
  preview: null,
  loading: true,
  submitting: false,
  done: false,
  error: "",
  reviewed: 0,
  history: [],
  shuffled: false,
  showExitConfirm: false,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const deckId = Number(id);
  const [state, dispatch] = useReducer(reviewReducer, initialState);
  const [fastMode, setFastMode] = useState(() => localStorage.getItem("fastMode") === "true");
  const toast = useToast();

  function toggleFastMode() {
    setFastMode((prev) => {
      const next = !prev;
      localStorage.setItem("fastMode", String(next));
      return next;
    });
  }

  async function loadCards() {
    try {
      const data = await cardsApi.forReview(deckId);
      dispatch({
        type: "LOAD_CARDS",
        cards: state.shuffled ? shuffle(data.cards) : data.cards,
      });
    } catch {
      navigate(`/decks/${deckId}`);
    }
  }

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffled não deve causar re-fetch
  }, [deckId]);

  const handleFlip = useCallback(async () => {
    if (state.flipped) return;
    dispatch({ type: "FLIP" });
    try {
      const preview = await cardsApi.preview(deckId, state.cards[state.index].id);
      dispatch({ type: "SET_PREVIEW", preview });
    } catch {
      /* preview opcional */
    }
  }, [state.flipped, state.cards, state.index, deckId]);

  const handleRate = useCallback(async (rating: number) => {
    if (state.submitting) return;
    dispatch({ type: "SET_SUBMITTING", submitting: true });
    try {
      const result = await cardsApi.review(deckId, state.cards[state.index].id, rating);
      if (result.new_achievements?.length) {
        result.new_achievements.forEach((a) => {
          toast.success(`🎉 Conquista: ${a.title}`);
        });
      }
      dispatch({ type: "RATE", rating });
    } catch (err: unknown) {
      dispatch({
        type: "SET_ERROR",
        error:
          err instanceof Error
            ? err.message
            : "Erro ao salvar revisão. Tente novamente.",
      });
    }
  }, [state.submitting, state.cards, state.index, deckId]);

  const handleShuffleToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE" });
    dispatch({
      type: "REORDER_CARDS",
      cards: state.shuffled
        ? [...state.cards].sort((a, b) => a.id - b.id)
        : shuffle(state.cards),
    });
  }, [state.shuffled, state.cards]);

  useEffect(() => {
    if (fastMode && !state.flipped && !state.loading && !state.done && state.cards.length > 0) {
      handleFlip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleFlip é estável com base em state.index
  }, [state.index, fastMode, state.flipped, state.loading, state.done]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (!state.flipped) {
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
  }, [state.flipped, state.submitting, state.index, handleFlip, handleRate]);

  if (state.loading)
    return <SkeletonReviewCard />;

  if (!state.loading && state.cards.length === 0)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <EmptyState
          icon={<Check size={28} color="var(--success)" />}
          title="Nenhum card disponível para revisão hoje"
          description="Você está em dia 🎉"
        />
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            marginTop: "16px",
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          ← Voltar ao início
        </button>
      </div>
    );

  if (state.done)
    return (
      <ReviewSessionSummary
        reviewed={state.reviewed}
        history={state.history}
        onGoHome={() => navigate("/")}
        onGoToDeck={() => navigate(`/decks/${deckId}`)}
      />
    );

  const card = state.cards[state.index];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ReviewHeader
        onExit={() => dispatch({ type: "SET_EXIT_CONFIRM", show: true })}
        history={state.history}
        index={state.index}
        total={state.cards.length}
        shuffled={state.shuffled}
        onShuffleToggle={handleShuffleToggle}
        theme={theme}
        onThemeToggle={toggle}
        fastMode={fastMode}
        onFastModeToggle={toggleFastMode}
      />

      <ReviewSessionProgress
        current={state.index}
        total={state.cards.length}
      />

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
          <ReviewCard
            card={card}
            flipped={state.flipped}
            onFlip={handleFlip}
          />

          <RatingButtons
            preview={state.preview}
            submitting={state.submitting}
            onRate={handleRate}
            flipped={state.flipped}
            error={state.error}
          />
        </div>
      </main>

      {state.showExitConfirm && (
        <ConfirmModal
          title="Encerrar revisão?"
          message="Você ainda não terminou todos os cards. O progresso desta sessão será perdido."
          confirmText="Sair da revisão"
          confirmVariant="secondary"
          icon={<LogOut size={18} />}
          iconBg="rgba(203,166,247,0.12)"
          iconColor="var(--accent)"
          buttonIcon={<LogOut size={13} />}
          onConfirm={() => navigate(`/decks/${deckId}`)}
          onCancel={() => dispatch({ type: "SET_EXIT_CONFIRM", show: false })}
        />
      )}
    </div>
  );
}
