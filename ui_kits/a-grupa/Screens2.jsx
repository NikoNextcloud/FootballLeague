const { MatchCard, TeamCard, StandingsTable, StatGrid, EmptyState, Chip, ChipGroup, Select } = window.DesignSystem_2890b2;

const page = { fontFamily: "var(--font-sans)" };
const pageH1 = { fontSize: "var(--text-page-title)", margin: "12px 2px 2px", color: "var(--text-primary)" };
const pageSub = { color: "var(--text-secondary)", margin: "0 2px 14px", fontSize: 13 };

function MatchesScreen({ data }) {
  const [filter, setFilter] = React.useState("all");
  const [team, setTeam] = React.useState("all");

  const teamNames = React.useMemo(() => {
    const set = new Set();
    data.events.forEach((e) => { set.add(e.strHomeTeam); set.add(e.strAwayTeam); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "bg"));
  }, [data]);

  const filtered = React.useMemo(() => {
    let list = [...data.events];
    if (filter === "upcoming") list = list.filter((e) => e.intHomeScore === null);
    if (filter === "results") list = list.filter((e) => e.intHomeScore !== null);
    if (team !== "all") list = list.filter((e) => e.strHomeTeam === team || e.strAwayTeam === team);
    list.sort((a, b) => (a.dateEvent < b.dateEvent ? -1 : 1));
    if (filter === "results") list.reverse();
    return list;
  }, [data, filter, team]);

  return (
    <div style={page}>
      <h1 style={pageH1}>Мачове</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", margin: "8px 2px 16px" }}>
        <ChipGroup>
          {["all", "upcoming", "results"].map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "Всички" : f === "upcoming" ? "Предстоящи" : "Резултати"}
            </Chip>
          ))}
        </ChipGroup>
        <Select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="all">Всички отбори</option>
          {teamNames.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      {!filtered.length && <EmptyState>Няма мачове по зададените филтри.</EmptyState>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map((e) => <MatchCard key={e.idEvent} event={e} />)}
      </div>
    </div>
  );
}

function TeamsScreen({ data, navigate }) {
  return (
    <div style={page}>
      <h1 style={pageH1}>Отбори</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
        {data.teams.map((t) => (
          <TeamCard key={t.idTeam} name={t.strTeam} badgeSrc={t.strBadge} onClick={() => navigate("otbori/" + t.idTeam)} />
        ))}
      </div>
    </div>
  );
}

function TeamDetailScreen({ data, teamId, navigate }) {
  const team = data.teams.find((t) => t.idTeam === teamId) || data.teams[0];
  const row = data.table.find((r) => r.idTeam === team.idTeam);
  const matches = data.events.filter((e) => e.idHomeTeam === team.idTeam || e.idAwayTeam === team.idTeam);

  return (
    <div style={page}>
      <a onClick={() => navigate("otbori")} style={{ display: "inline-block", margin: "12px 2px", fontSize: 13, color: "var(--accent-link)", fontWeight: 600, cursor: "pointer" }}>← Всички отбори</a>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 2px 4px" }}>
        <img src={team.strBadge} alt="" width={64} height={64} style={{ objectFit: "contain", borderRadius: 6 }} />
        <div>
          <h1 style={{ margin: 0, color: "var(--text-primary)", fontSize: "var(--text-page-title)" }}>{team.strTeam}</h1>
          {team.strStadium && <p style={pageSub}>{team.strStadium}</p>}
        </div>
      </div>

      {row && (
        <section style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>Статистика от сезона</h2>
          <StatGrid stats={[
            { value: row.intRank, label: "място" },
            { value: row.intPoints, label: "точки" },
            { value: row.intPlayed, label: "мачове" },
            { value: row.intWin, label: "победи" },
            { value: row.intDraw, label: "равни" },
            { value: row.intLoss, label: "загуби" },
          ]} />
        </section>
      )}

      {team.strDescriptionEN && (
        <section style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>За отбора</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{team.strDescriptionEN}</p>
        </section>
      )}

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>Мачове</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {matches.map((e) => <MatchCard key={e.idEvent} event={e} />)}
        </div>
      </section>
    </div>
  );
}

function ArchiveScreen({ data }) {
  const [season, setSeason] = React.useState(data.archiveSeasons[0]);
  return (
    <div style={page}>
      <h1 style={pageH1}>Архив</h1>
      <p style={pageSub}>Класирания и мачове от предходни сезони</p>
      <div style={{ display: "flex", margin: "8px 2px 16px" }}>
        <Select value={season} onChange={(e) => setSeason(e.target.value)}>
          {data.archiveSeasons.map((s) => <option key={s} value={s}>Сезон {s}</option>)}
        </Select>
      </div>
      <section>
        <h2 style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>Класиране {season}</h2>
        <StandingsTable rows={data.table} />
      </section>
      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: "var(--text-section)", color: "var(--text-primary)" }}>Мачове {season}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {data.events.slice(0, 4).map((e) => <MatchCard key={e.idEvent} event={e} />)}
        </div>
        <p style={{ color: "var(--text-secondary)", padding: "14px 4px", fontSize: 13 }}>Показани са първите 4 мача от архивния сезон (демонстрация).</p>
      </section>
    </div>
  );
}

window.UIKitScreens2 = { MatchesScreen, TeamsScreen, TeamDetailScreen, ArchiveScreen };
