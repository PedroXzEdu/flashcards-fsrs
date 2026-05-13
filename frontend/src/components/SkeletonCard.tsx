export function SkeletonDeckCard() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div
        className="skeleton"
        style={{ height: "16px", width: "60%", marginBottom: "10px" }}
      />
      <div
        className="skeleton"
        style={{ height: "12px", width: "40%", marginBottom: "14px" }}
      />
      <div
        className="skeleton"
        style={{ height: "22px", width: "80px", borderRadius: "6px" }}
      />
    </div>
  );
}

export function SkeletonCardItem() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        className="skeleton"
        style={{
          height: "24px",
          width: "80px",
          borderRadius: "6px",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          className="skeleton"
          style={{ height: "14px", width: "55%", marginBottom: "8px" }}
        />
        <div className="skeleton" style={{ height: "12px", width: "35%" }} />
      </div>
    </div>
  );
}
