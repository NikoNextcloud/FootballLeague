import React from "react";

// Pill-shaped filter toggle, used in groups (see ChipGroup) for
// all/upcoming/results style filters.
export function Chip({ active = false, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--accent-primary)" : "var(--surface-card)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--surface-card-border)"}`,
        color: active ? "var(--text-on-accent)" : "var(--text-secondary)",
        padding: "7px 14px",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-body-sm)",
        fontWeight: "var(--weight-semibold)",
        fontFamily: "var(--font-sans)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// Horizontal row of Chips with the standard 6px gap.
export function ChipGroup({ children }) {
  return <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{children}</div>;
}
