import React from "react";

// Row of stat tiles (season record) — 3 cols mobile, 6 cols desktop in the source app.
export function StatGrid({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, fontFamily: "var(--font-sans)" }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: "var(--surface-card)", border: "1px solid var(--surface-card-border)", borderRadius: "var(--radius-lg)", padding: "12px 8px", textAlign: "center" }}>
          <span style={{ display: "block", fontSize: 20, fontWeight: "var(--weight-black)", color: "var(--text-primary)" }}>{s.value}</span>
          <label style={{ fontSize: "var(--text-micro)", color: "var(--text-secondary)", textTransform: "uppercase" }}>{s.label}</label>
        </div>
      ))}
    </div>
  );
}
