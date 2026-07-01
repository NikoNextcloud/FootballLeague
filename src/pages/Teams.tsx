// src/pages/Teams.tsx
import { Link } from "react-router-dom";
import { useLeagueData } from "../lib/useLeagueData";
import TeamBadge from "../components/TeamBadge";

export default function Teams() {
  const { data, loading } = useLeagueData();
  const teams = data?.teams?.length ? data.teams : [];

  return (
    <div className="page">
      <h1>Отбори</h1>
      {loading && <p className="empty-note">Зареждане…</p>}
      {!loading && !teams.length && <p className="empty-note">Данните за отборите все още не са налични.</p>}
      <div className="team-grid">
        {teams.map((t) => (
          <Link to={`/otbori/${t.idTeam}`} key={t.idTeam} className="team-card">
            <TeamBadge src={t.strBadge} name={t.strTeam} size={48} />
            <span>{t.strTeam}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
