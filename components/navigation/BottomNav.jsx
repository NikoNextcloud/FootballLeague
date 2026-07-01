import React from "react";
import { NAV_LINKS } from "./Header.jsx";

// Fixed bottom tab bar (mobile only — hides at 720px+).
export function BottomNav({ activePath = "/", onNavigate }) {
  return (
    <nav
      className="ds-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        background: "rgba(11, 15, 22, 0.92)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--surface-card-border)",
        padding: "6px 4px 6px",
        zIndex: 30,
        fontFamily: "var(--font-sans)",
      }}
    >
      {NAV_LINKS.map((l) => {
        const active = activePath === l.to;
        return (
          <a
            key={l.to}
            href={l.to}
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(l.to); }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: active ? "var(--accent-primary)" : "var(--text-secondary)",
              background: active ? "rgba(34,197,94,0.1)" : "transparent",
              fontSize: "var(--text-nano)",
              padding: "4px 10px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{l.icon}</span>
            <span>{l.label}</span>
          </a>
        );
      })}
      <style>{`@media (min-width: 720px) { .ds-bottom-nav { display: none !important; } }`}</style>
    </nav>
  );
}
