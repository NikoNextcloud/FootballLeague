// src/pages/Matches.tsx
import { useMemo, useState } from "react";
import { useLeagueData } from "../lib/useLeagueData";
import MatchCard from "../components/MatchCard";

type Filter = "all" | "upcoming" | "results";

export default function Matches() {
  const { data, loading } = useLeagueData();
  const [filter, setFilter] = useState<Filter>("all");
  const [team, setTeam] = useState("all");

  const teams = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.events.forEach((e) => {
      set.add(e.strHomeTeam);
      set.add(e.strAwayTeam);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bg"));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...data.events];
    if (filter === "upcoming") list = list.filter((e) => e.intHomeScore === null || e.intHomeScore === "");
    if (filter === "results") list = list.filter((e) => e.intHomeScore !== null && e.intHomeScore !== "");
    if (team !== "all") list = list.filter((e) => e.strHomeTeam === team || e.strAwayTeam === team);
    list.sort((a, b) => (a.dateEvent < b.dateEvent ? -1 : 1));
    // За резултати - най-новите най-отгоре
    if (filter === "results") list.reverse();
    return list;
  }, [data, filter, team]);

  return (
    <div className="page">
      <h1>Мачове</h1>

      <div className="filters">
        <div className="chip-group">
          {(["all", "upcoming", "results"] as Filter[]).map((f) => (
            <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Всички" : f === "upcoming" ? "Предстоящи" : "Резултати"}
            </button>
          ))}
        </div>
        <select value={team} onChange={(e) => setTeam(e.target.value)} className="team-select">
          <option value="all">Всички отбори</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="empty-note">Зареждане…</p>}
      {!loading && !filtered.length && <p className="empty-note">Няма мачове по зададените филтри.</p>}

      <div className="match-grid">
        {filtered.map((e) => (
          <MatchCard key={e.idEvent} event={e} />
        ))}
      </div>
    </div>
  );
}
