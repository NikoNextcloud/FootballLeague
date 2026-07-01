import React from "react";
import { TeamBadge } from "../core/TeamBadge.jsx";

// One row in the goalscorer ranking (Home preview + full Голмайстори page).
export function ScorerRow({ rank, player, team, teamBadge, goals }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface-card)", border: "1px solid var(--surface-card-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", fontFamily: "var(--font-sans)" }}>
      <span style={{ width: 18, color: "var(--text-secondary)", fontWeight: "var(--weight-bold)" }}>{rank}</span>
      <TeamBadge src={teamBadge} name={team} size={22} />
      <span style={{ flex: 1, fontWeight: "var(--weight-semibold)" }}>{player}</span>
      <span style={{ fontWeight: "var(--weight-black)", color: "var(--accent-primary)" }}>{goals}</span>
    </div>
  );
}
