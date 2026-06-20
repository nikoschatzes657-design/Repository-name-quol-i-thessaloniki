export default function LegendPanel({ onClose, breaks, colors, title }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 68, left: 12,
        zIndex: 65, width: 280, maxHeight: "60vh", overflow: "auto",
        background: "rgba(15,20,28,.96)", color: "var(--text-0)",
        border: "1px solid var(--line)", borderRadius: 14,
        boxShadow: "var(--shadow)", padding: 12,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ fontWeight: 800, color: "var(--text-1)" }}>{title}</div>
        <button className="btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}>✖</button>
      </div>
      <div style={{ fontSize: 12, opacity: .85, marginBottom: 8 }}>Διακριτές κατηγορίες (step) με βάση το <code>_score_vis</code>.</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 10px" }}>
        {breaks.slice(0, -1).map((b, i) => {
          const a = b, c = breaks[i + 1], col = colors[i];
          return (
            <div key={i} style={{ display: "contents" }}>
              <div style={{ width: 22, height: 14, borderRadius: 3, background: col, border: "1px solid #263447" }} />
              <div style={{ fontSize: 13 }}>
                {a.toFixed(1)}–{c.toFixed(1)} {i === breaks.length - 2 ? "(≤1.0)" : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>Κόκκινο → χαμηλό • Πράσινο → υψηλό</div>
    </div>
  );
}
