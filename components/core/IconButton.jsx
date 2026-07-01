import React from "react";

// Small square icon-only button, e.g. the push-notification bell toggle.
// `on` renders the accent border to show an active/subscribed state.
export function IconButton({ children, on = false, disabled = false, onClick, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${on ? "var(--accent-primary)" : "var(--surface-card-border)"}`,
        color: "var(--text-primary)",
        width: 34,
        height: 34,
        borderRadius: "var(--radius-md)",
        fontSize: 15,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}
