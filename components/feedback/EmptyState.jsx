import React from "react";

// Muted single-line note for loading/empty/error states — used across every page.
export function EmptyState({ children }) {
  return (
    <p style={{ color: "var(--text-secondary)", padding: "14px 4px", fontSize: "var(--text-body)", fontFamily: "var(--font-sans)", margin: 0 }}>
      {children}
    </p>
  );
}
