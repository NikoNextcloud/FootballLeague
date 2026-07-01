// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useLeagueData } from "../lib/useLeagueData";
import { useJson } from "../lib/useJson";
import type { ScorersData } from "../types";
import StandingsTable from "../components/StandingsTable";
import MatchCard from "../components/MatchCard";
import TeamBadge from "../components/TeamBadge";

function timeAgo(iso: string) {
  if (!iso) return "";
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "току-що";
  if (diffMin < 60) return `преди ${diffMin} мин`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `преди ${h} ч`;
  return `преди ${Math.round(h / 24)} дни`;
}

export default function Home() {
  const { data, loading, error } = useLeagueData();
  const { data: scorers } = useJson<ScorersData>("data/scorers.json");

  return (
    <div className="page">
      <section className="hero">
        <img src="./logo-square.png" alt="А Група" className="hero-logo" />
        <div>
          <h1>А Група</h1>
          <p>Класиране, мачове и резултати от efbet Лига — сезон {data?.meta.season ?? "…"}</p>
          {data?.meta.updatedAt && (
            <p className="updated-note">Обновено {timeAgo(data.meta.updatedAt)}</p>
          )}
        </div>
      </section>

      {loading && <p className="empty-note">Зареждане на данни…</p>}
      {error && <p className="empty-note">Данните все още не са налични. Стартирай fetch-data workflow-а.</p>}

      {data && (
        <>
          <section className="section">
            <div className="section-head">
              <h2>Класиране</h2>
              <Link to="/klasirane">Пълно класиране →</Link>
            </div>
            <StandingsTable rows={data.table.slice(0, 8)} compact />
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Предстоящи мачове</h2>
              <Link to="/machove">Всички мачове →</Link>
            </div>
            <div className="match-grid">
              {(data.next.length ? data.next : data.events.filter((e) => !e.intHomeScore)).slice(0, 6).map((e) => (
                <MatchCard key={e.idEvent} event={e} />
              ))}
              {!data.next.length && !data.events.length && <p className="empty-note">Няма предстоящи мачове.</p>}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Последни резултати</h2>
            </div>
            <div className="match-grid">
              {(data.past.length ? data.past : data.events.filter((e) => e.intHomeScore)).slice(0, 6).map((e) => (
                <MatchCard key={e.idEvent} event={e} />
              ))}
              {!data.past.length && !data.events.length && <p className="empty-note">Няма изиграни мачове все още.</p>}
            </div>
          </section>
          <section className="section">
            <div className="section-head">
              <h2>Голмайстори</h2>
              <Link to="/golmaistori">Пълна класация →</Link>
            </div>
            {scorers?.list?.length ? (
              <div className="scorer-list">
                {scorers.list.slice(0, 5).map((s, i) => (
                  <div key={`${s.player}-${s.team}`} className="scorer-row">
                    <span className="scorer-rank">{i + 1}</span>
                    <TeamBadge src={s.teamBadge} name={s.team} size={22} />
                    <span className="scorer-name">{s.player}</span>
                    <span className="scorer-goals">{s.goals}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-note">Класацията се попълва постепенно.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
