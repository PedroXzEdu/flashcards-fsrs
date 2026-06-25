import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "20px 0",
      }}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        aria-label="Página anterior"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "8px 14px",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--bg-card)",
          color: currentPage <= 1 || loading ? "var(--text-muted)" : "var(--text)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: currentPage <= 1 || loading ? "not-allowed" : "pointer",
          fontFamily: "Outfit, sans-serif",
          opacity: currentPage <= 1 || loading ? 0.5 : 1,
          transition: "all 0.15s",
        }}
      >
        <ChevronLeft size={14} />
        Anterior
      </button>

      <span
        style={{
          fontSize: "13px",
          color: "var(--text-sub)",
          fontWeight: 500,
          padding: "0 4px",
        }}
      >
        {loading ? "Carregando..." : `Página ${currentPage} de ${totalPages}`}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        aria-label="Próxima página"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "8px 14px",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--bg-card)",
          color:
            currentPage >= totalPages || loading ? "var(--text-muted)" : "var(--text)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: currentPage >= totalPages || loading ? "not-allowed" : "pointer",
          fontFamily: "Outfit, sans-serif",
          opacity: currentPage >= totalPages || loading ? 0.5 : 1,
          transition: "all 0.15s",
        }}
      >
        Próximo
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
