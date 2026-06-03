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

export function SkeletonReviewCard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "640px" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "clamp(24px, 5vw, 48px)",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <div
            className="skeleton"
            style={{ height: "12px", width: "50px", marginBottom: "24px" }}
          />
          <div
            className="skeleton"
            style={{ height: "20px", width: "60%", marginBottom: "10px" }}
          />
          <div className="skeleton" style={{ height: "16px", width: "40%" }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "60px", borderRadius: "14px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {[1, 2, 3].map((i) => (
        <SkeletonDeckCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonQueueItem() {
  return (
    <div
      style={{
        borderRadius: "10px",
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="skeleton" style={{ height: "14px", width: "60%" }} />
      <div className="skeleton" style={{ height: "14px", width: "40px" }} />
    </div>
  );
}

export function SkeletonSharedDeck() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          className="skeleton"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            margin: "0 auto 20px",
          }}
        />
        <div
          className="skeleton"
          style={{
            height: "20px",
            width: "60%",
            margin: "0 auto 10px",
          }}
        />
        <div
          className="skeleton"
          style={{
            height: "14px",
            width: "40%",
            margin: "0 auto 16px",
          }}
        />
        <div
          className="skeleton"
          style={{ height: "48px", borderRadius: "10px", marginTop: "24px" }}
        />
      </div>
    </div>
  );
}
