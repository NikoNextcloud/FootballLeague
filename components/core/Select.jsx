import React from "react";

// Glass-style native select, used for the team filter dropdown.
export function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
        color: "var(--text-primary)",
        padding: "7px 12px",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-body-sm)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </select>
  );
}
