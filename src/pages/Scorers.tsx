// src/pages/Scorers.tsx
import { useJson } from "../lib/useJson";
import type { ScorersData } from "../types";
import TeamBadge from "../components/TeamBadge";

export default function Scorers() {
  const { data, loading } = useJson<ScorersData>("data/scorers.json");

  return (
    <div className="page">
      <h1>Голмайстори</h1>
      <p className="page-sub">
        {data ? `Изчислено от ${data.processedMatches}/${data.totalMatches} изиграни мача` : "…"}
      </p>

      {loading && <p className="empty-note">Зареждане…</p>}

      {data && !data.list.length && (
        <p className="empty-note">
          Все още няма достатъчно данни за класация на голмайсторите — тя се попълва постепенно с всяко обновяване.
        </p>
      )}

      {data && data.list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="standings">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-team">Играч</th>
                  <th className="hide-mobile">Отбор</th>
                  <th>Голове</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((s, i) => (
                  <tr key={`${s.player}-${s.team}`}>
                    <td className="col-rank">{i + 1}</td>
                    <td className="col-team">
                      <span className="team-cell">
                        <TeamBadge src={s.teamBadge} name={s.team} size={22} />
                        <span className="team-name">{s.player}</span>
                      </span>
                    </td>
                    <td className="hide-mobile">{s.team}</td>
                    <td className="col-points">{s.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="disclaimer">{data.note}</p>
        </>
      )}
    </div>
  );
}
