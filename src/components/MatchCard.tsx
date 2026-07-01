// src/components/MatchCard.tsx
import type { EventItem } from "../types";
import TeamBadge from "./TeamBadge";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit" });
}

export default function MatchCard({ event }: { event: EventItem }) {
  const played = event.intHomeScore !== null && event.intHomeScore !== undefined && event.intHomeScore !== "";
  const status = event.strStatus;
  const isLive = status && !["FT", "Match Finished", "Not Started", "NS"].includes(status) && status !== "";

  return (
    <div className="match-card">
      <div className="match-meta">
        <span>{formatDate(event.dateEvent)}</span>
        {event.strTime && !played && <span>{event.strTime.slice(0, 5)}</span>}
        {isLive && <span className="live-badge">На живо</span>}
        {event.intRound && <span className="round">кръг {event.intRound}</span>}
      </div>
      <div className="match-body">
        <div className="match-team">
          <TeamBadge src={event.strHomeTeamBadge} name={event.strHomeTeam} size={26} />
          <span>{event.strHomeTeam}</span>
        </div>
        <div className="match-score">
          {played ? (
            <span>
              {event.intHomeScore} : {event.intAwayScore}
            </span>
          ) : (
            <span className="vs">—</span>
          )}
        </div>
        <div className="match-team match-team--away">
          <span>{event.strAwayTeam}</span>
          <TeamBadge src={event.strAwayTeamBadge} name={event.strAwayTeam} size={26} />
        </div>
      </div>
      {event.strVenue && <div className="match-venue">{event.strVenue}</div>}
    </div>
  );
}
