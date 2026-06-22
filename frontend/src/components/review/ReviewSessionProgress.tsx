import ProgressBar from "../ProgressBar";

interface ReviewSessionProgressProps {
  current: number;
  total: number;
}

export default function ReviewSessionProgress({
  current,
  total,
}: ReviewSessionProgressProps) {
  return (
    <div style={{ padding: "12px 24px 0" }}>
      <ProgressBar current={current} total={total} />
    </div>
  );
}
