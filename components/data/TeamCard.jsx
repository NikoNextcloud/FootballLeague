import React from "react";
import { TeamBadge } from "../core/TeamBadge.jsx";

// Grid tile linking to a team's detail page — used on the Отбори (Teams) grid.
export function TeamCard({ name, badgeSrc, onClick }) {
  return (
    <a
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "18px 10px",
        fontSize: "var(--text-body-sm)",
        fontWeight: "var(--weight-semibold)",
        textAlign: "center",
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)",
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
        borderRadius: "var(--radius-xl)",
        backdropFilter: "blur(6px)",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      <TeamBadge src={badgeSrc} name={name} size={48} />
      <span>{name}</span>
    </a>
  );
}
