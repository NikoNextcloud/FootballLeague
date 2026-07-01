import React from "react";

export const NAV_LINKS = [
  { to: "/", label: "Начало", icon: "🏠" },
  { to: "/klasirane", label: "Класиране", icon: "📊" },
  { to: "/machove", label: "Мачове", icon: "⚽" },
  { to: "/golmaistori", label: "Голмайстори", icon: "🥅" },
  { to: "/otbori", label: "Отбори", icon: "🛡️" },
  { to: "/arhiv", label: "Архив", icon: "🗂️" },
];

// Sticky top header: brand mark + desktop nav (hidden under 720px) + notify slot.
// `activePath` picks the highlighted link; `notifySlot` accepts an <IconButton>.
export function Header({ activePath = "/", onNavigate, notifySlot, logoSrc }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(11, 15, 22, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--surface-card-border)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-normal)" }}>
        {logoSrc && <img src={logoSrc} alt="А Група" style={{ width: 34, height: 34, objectFit: "contain" }} />}
        <span style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>А Група</span>
      </div>
      <nav style={{ display: "none", gap: 22 }} className="ds-top-nav">
        {NAV_LINKS.map((l) => {
          const active = activePath === l.to;
          return (
            <a
              key={l.to}
              href={l.to}
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(l.to); }}
              style={{
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: "var(--weight-semibold)",
                fontSize: "var(--text-body)",
                padding: "6px 2px",
                borderBottom: `2px solid ${active ? "var(--accent-primary)" : "transparent"}`,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
      {notifySlot}
      <style>{`@media (min-width: 720px) { .ds-top-nav { display: flex !important; } }`}</style>
    </header>
  );
}
