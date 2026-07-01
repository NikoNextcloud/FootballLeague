import React from "react";
import { TeamBadge } from "../core/TeamBadge.jsx";

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit" });
}

// Glass card for one fixture — shows score if played, kickoff time + round if upcoming.
export function MatchCard({ event }) {
  const played = event.intHomeScore !== null && event.intHomeScore !== undefined && event.intHomeScore !== "";
  const status = event.strStatus;
  const isLive = status && !["FT", "Match Finished", "Not Started", "NS"].includes(status) && status !== "";

  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--surface-card-border)", borderRadius: "var(--radius-xl)", backdropFilter: "blur(6px)", padding: "12px 14px", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", gap: 10, fontSize: "var(--text-micro)", color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>
        <span>{formatDate(event.dateEvent)}</span>
        {event.strTime && !played && <span>{event.strTime.slice(0, 5)}</span>}
        {isLive && <span style={{ color: "var(--accent-primary)", fontWeight: "var(--weight-bold)" }}>На живо</span>}
        {event.intRound && <span style={{ marginLeft: "auto" }}>кръг {event.intRound}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)" }}>
          <TeamBadge src={event.strHomeTeamBadge} name={event.strHomeTeam} size={26} />
          <span>{event.strHomeTeam}</span>
        </div>
        <div style={{ fontWeight: "var(--weight-black)", fontSize: 15, minWidth: 46, textAlign: "center", color: "var(--text-primary)" }}>
          {played ? <span>{event.intHomeScore} : {event.intAwayScore}</span> : <span style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}>—</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)", justifyContent: "flex-end", textAlign: "right" }}>
          <span>{event.strAwayTeam}</span>
          <TeamBadge src={event.strAwayTeamBadge} name={event.strAwayTeam} size={26} />
        </div>
      </div>
      {event.strVenue && <div style={{ marginTop: 8, fontSize: "var(--text-micro)", color: "var(--text-secondary)" }}>{event.strVenue}</div>}
    </div>
  );
}
