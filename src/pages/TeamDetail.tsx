// src/pages/TeamDetail.tsx
import { useParams, Link } from "react-router-dom";
import { useLeagueData } from "../lib/useLeagueData";
import TeamBadge from "../components/TeamBadge";
import MatchCard from "../components/MatchCard";

export default function TeamDetail() {
  const { id } = useParams();
  const { data, loading } = useLeagueData();

  if (loading) return <div className="page"><p className="empty-note">Зареждане…</p></div>;

  const team = data?.teams.find((t) => t.idTeam === id);
  const row = data?.table.find((r) => r.idTeam === id);
  const matches = (data?.events ?? [])
    .filter((e) => e.idHomeTeam === id || e.idAwayTeam === id)
    .sort((a, b) => (a.dateEvent < b.dateEvent ? -1 : 1));

  if (!team) {
    return (
      <div className="page">
        <p className="empty-note">Отборът не е намерен.</p>
        <Link to="/otbori">← Назад към отборите</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/otbori" className="back-link">← Всички отбори</Link>
      <div className="team-header">
        <TeamBadge src={team.strBadge} name={team.strTeam} size={64} />
        <div>
          <h1>{team.strTeam}</h1>
          {team.strStadium && <p className="page-sub">{team.strStadium}</p>}
        </div>
      </div>

      {row && (
        <section className="section">
          <h2>Статистика от сезона</h2>
          <div className="stat-grid">
            <div><span>{row.intRank}</span><label>място</label></div>
            <div><span>{row.intPoints}</span><label>точки</label></div>
            <div><span>{row.intPlayed}</span><label>мачове</label></div>
            <div><span>{row.intWin}</span><label>победи</label></div>
            <div><span>{row.intDraw}</span><label>равни</label></div>
            <div><span>{row.intLoss}</span><label>загуби</label></div>
          </div>
        </section>
      )}

      {team.strDescriptionEN && (
        <section className="section">
          <h2>За отбора</h2>
          <p className="team-desc">{team.strDescriptionEN}</p>
        </section>
      )}

      <section className="section">
        <h2>Мачове</h2>
        <div className="match-grid">
          {matches.length ? (
            matches.map((e) => <MatchCard key={e.idEvent} event={e} />)
          ) : (
            <p className="empty-note">Няма данни за мачове.</p>
          )}
        </div>
      </section>
    </div>
  );
}
