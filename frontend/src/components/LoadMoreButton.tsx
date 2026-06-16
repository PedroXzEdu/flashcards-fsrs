import Button from "./Button";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function LoadMoreButton({ onClick, loading }: LoadMoreButtonProps) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        loading={loading}
        type="button"
      >
        Carregar mais
      </Button>
    </div>
  );
}
