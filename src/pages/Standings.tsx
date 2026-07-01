// src/pages/Standings.tsx
import { useLeagueData } from "../lib/useLeagueData";
import StandingsTable from "../components/StandingsTable";

export default function Standings() {
  const { data, loading } = useLeagueData();
  return (
    <div className="page">
      <h1>Класиране</h1>
      <p className="page-sub">Сезон {data?.meta.season ?? "…"}</p>
      {loading && <p className="empty-note">Зареждане…</p>}
      {data && <StandingsTable rows={data.table} />}
    </div>
  );
}
