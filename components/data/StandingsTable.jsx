import React from "react";
import { TeamBadge } from "../core/TeamBadge.jsx";

// Full league table with zone highlighting (champion / Europe / relegation).
// `compact` hides secondary columns (W/D/L, GF:GA, form) for the homepage preview.
export function StandingsTable({ rows, compact = false }) {
  if (!rows || !rows.length) {
    return <p style={{ color: "var(--text-secondary)", padding: "14px 4px", fontSize: 14, fontFamily: "var(--font-sans)" }}>Класирането все още не е налично за текущия сезон.</p>;
  }

  const zoneShadow = (rank) => {
    if (rank <= 1) return "inset 3px 0 0 var(--zone-title)";
    if (rank <= 6) return "inset 3px 0 0 var(--zone-europe)";
    if (rank >= rows.length - 1) return "inset 3px 0 0 var(--zone-relegation)";
    return "none";
  };

  const th = { color: "var(--text-secondary)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-micro)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", borderBottom: "1px solid var(--surface-card-border)", padding: "9px 8px", textAlign: "center" };
  const td = { padding: "9px 8px", textAlign: "center", whiteSpace: "nowrap" };

  return (
    <div style={{ overflowX: "auto", borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-card-border)", background: "var(--surface-card)", fontFamily: "var(--font-sans)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)", minWidth: 480 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: 32 }}>#</th>
            <th style={{ ...th, textAlign: "left" }}>Отбор</th>
            <th style={th}>И</th>
            {!compact && <th style={th}>П</th>}
            {!compact && <th style={th}>Р</th>}
            {!compact && <th style={th}>З</th>}
            {!compact && <th style={th}>ГР</th>}
            <th style={th}>+/-</th>
            <th style={th}>Т</th>
            {!compact && <th style={th}>Форма</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const rank = Number(r.intRank);
            const diff = Number(r.intGoalDifference ?? 0);
            return (
              <tr key={r.idTeam} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ ...td, fontWeight: "var(--weight-bold)", color: "var(--text-secondary)", boxShadow: zoneShadow(rank) }}>{rank}</td>
                <td style={{ ...td, textAlign: "left" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TeamBadge src={r.strBadge} name={r.strTeam} size={22} />
                    <span style={{ fontWeight: "var(--weight-semibold)" }}>{r.strTeam}</span>
                  </span>
                </td>
                <td style={td}>{r.intPlayed}</td>
                {!compact && <td style={td}>{r.intWin}</td>}
                {!compact && <td style={td}>{r.intDraw}</td>}
                {!compact && <td style={td}>{r.intLoss}</td>}
                {!compact && <td style={td}>{r.intGoalsFor}:{r.intGoalsAgainst}</td>}
                <td style={{ ...td, color: diff > 0 ? "var(--accent-primary)" : diff < 0 ? "var(--status-danger)" : "var(--text-primary)" }}>
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                <td style={{ ...td, fontWeight: "var(--weight-black)" }}>{r.intPoints}</td>
                {!compact && <td style={td}>{r.strForm ?? "—"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "10px 12px", fontSize: "var(--text-micro)", color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--zone-title)", display: "inline-block" }} />Шампион</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--zone-europe)", display: "inline-block" }} />Плейоф за титлата / Европа</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--zone-relegation)", display: "inline-block" }} />Плейоф за оставане</span>
      </div>
    </div>
  );
}
