// src/components/StandingsTable.tsx
import type { TableRow } from "../types";
import TeamBadge from "./TeamBadge";

export default function StandingsTable({ rows, compact = false }: { rows: TableRow[]; compact?: boolean }) {
  if (!rows.length) {
    return <p className="empty-note">Класирането все още не е налично за текущия сезон.</p>;
  }

  const zoneClass = (rank: number) => {
    if (rank <= 1) return "zone-title";
    if (rank <= 6) return "zone-europe";
    if (rank >= rows.length - 1) return "zone-relegation";
    return "";
  };

  return (
    <div className="table-wrap">
      <table className="standings">
        <thead>
          <tr>
            <th className="col-rank">#</th>
            <th className="col-team">Отбор</th>
            <th>И</th>
            {!compact && <th>П</th>}
            {!compact && <th>Р</th>}
            {!compact && <th>З</th>}
            {!compact && <th className="hide-mobile">ГР</th>}
            <th>+/-</th>
            <th>Т</th>
            {!compact && <th className="hide-mobile">Форма</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const rank = Number(r.intRank);
            const diff = Number(r.intGoalDifference ?? 0);
            return (
              <tr key={r.idTeam} className={zoneClass(rank)}>
                <td className="col-rank">{rank}</td>
                <td className="col-team">
                  <span className="team-cell">
                    <TeamBadge src={r.strBadge} name={r.strTeam} size={22} />
                    <span className="team-name">{r.strTeam}</span>
                  </span>
                </td>
                <td>{r.intPlayed}</td>
                {!compact && <td>{r.intWin}</td>}
                {!compact && <td>{r.intDraw}</td>}
                {!compact && <td>{r.intLoss}</td>}
                {!compact && (
                  <td className="hide-mobile">
                    {r.intGoalsFor}:{r.intGoalsAgainst}
                  </td>
                )}
                <td className={diff > 0 ? "pos" : diff < 0 ? "neg" : ""}>
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                <td className="col-points">{r.intPoints}</td>
                {!compact && <td className="hide-mobile">{r.strForm ?? "—"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="legend">
        <span><i className="dot dot-title" />Шампион</span>
        <span><i className="dot dot-europe" />Плейоф за титлата / Европа</span>
        <span><i className="dot dot-relegation" />Плейоф за оставане</span>
      </div>
    </div>
  );
}
