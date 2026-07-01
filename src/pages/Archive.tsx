// src/pages/Archive.tsx
import { useState } from "react";
import { useJson } from "../lib/useJson";
import type { ArchiveSeasonData } from "../types";
import StandingsTable from "../components/StandingsTable";
import MatchCard from "../components/MatchCard";

export default function Archive() {
  const { data: index, loading: loadingIndex } = useJson<{ seasons: string[] }>("data/archive/index.json");
  const [season, setSeason] = useState<string | null>(null);

  const activeSeason = season ?? index?.seasons?.[0] ?? null;

  const { data: seasonData, loading: loadingSeason } = useJson<ArchiveSeasonData>(
    activeSeason ? `data/archive/${activeSeason}.json` : "data/archive/index.json",
    [activeSeason]
  );

  return (
    <div className="page">
      <h1>Архив</h1>
      <p className="page-sub">Класирания и мачове от предходни сезони</p>

      {loadingIndex && <p className="empty-note">Зареждане…</p>}

      {index && !index.seasons.length && (
        <p className="empty-note">
          Архивът все още не е зареден. Пусни <code>fetch-archive</code> workflow-а от GitHub Actions, за да се
          попълни.
        </p>
      )}

      {index && index.seasons.length > 0 && (
        <>
          <div className="filters">
            <select
              className="team-select"
              value={activeSeason ?? ""}
              onChange={(e) => setSeason(e.target.value)}
            >
              {index.seasons.map((s) => (
                <option key={s} value={s}>
                  Сезон {s}
                </option>
              ))}
            </select>
          </div>

          {loadingSeason && <p className="empty-note">Зареждане на сезон {activeSeason}…</p>}

          {seasonData && (
            <>
              <section className="section">
                <div className="section-head">
                  <h2>Класиране {seasonData.season}</h2>
                </div>
                <StandingsTable rows={seasonData.table} />
              </section>

              <section className="section">
                <div className="section-head">
                  <h2>Мачове {seasonData.season}</h2>
                </div>
                <div className="match-grid">
                  {seasonData.events.slice(0, 30).map((e) => (
                    <MatchCard key={e.idEvent} event={e} />
                  ))}
                </div>
                {seasonData.events.length > 30 && (
                  <p className="empty-note">Показани са първите 30 мача от {seasonData.events.length}.</p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
