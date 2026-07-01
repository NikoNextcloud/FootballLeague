const { StandingsTable, MatchCard, TeamCard, ScorerRow, StatGrid, EmptyState, Chip, ChipGroup, Select, TeamBadge } = window.DesignSystem_2890b2;

function timeAgo(iso) {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "току-що";
  if (diffMin < 60) return `преди ${diffMin} мин`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `преди ${h} ч`;
  return `преди ${Math.round(h / 24)} дни`;
}

const sectionHead = { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, padding: "0 2px" };
const sectionH2 = { fontSize: "var(--text-section)", margin: 0, color: "var(--text-primary)" };
const sectionLink = { fontSize: 13, color: "var(--accent-link)", fontWeight: "var(--weight-semibold)", textDecoration: "none", cursor: "pointer" };
const matchGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const page = { fontFamily: "var(--font-sans)" };

function Home({ data, navigate }) {
  return (
    <div style={page}>
      <section style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 2px 8px" }}>
        <img src="../../assets/logos/logo-square.png" alt="А Група" style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: "var(--text-hero)", margin: "0 0 4px", letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}>А Група</h1>
          <p style={{ margin: "2px 0", color: "var(--text-secondary)" }}>Класиране, мачове и резултати от efbet Лига — сезон {data.meta.season}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", opacity: 0.8, margin: "2px 0" }}>Обновено {timeAgo(data.meta.updatedAt)}</p>
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <div style={sectionHead}>
          <h2 style={sectionH2}>Класиране</h2>
          <a style={sectionLink} onClick={() => navigate("klasirane")}>Пълно класиране →</a>
        </div>
        <StandingsTable rows={data.table.slice(0, 8)} compact />
      </section>

      <section style={{ marginTop: 26 }}>
        <div style={sectionHead}>
          <h2 style={sectionH2}>Предстоящи мачове</h2>
          <a style={sectionLink} onClick={() => navigate("machove")}>Всички мачове →</a>
        </div>
        <div style={matchGrid}>
          {data.next.slice(0, 4).map((e) => <MatchCard key={e.idEvent} event={e} />)}
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <div style={sectionHead}><h2 style={sectionH2}>Последни резултати</h2></div>
        <div style={matchGrid}>
          {data.past.slice(0, 4).map((e) => <MatchCard key={e.idEvent} event={e} />)}
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <div style={sectionHead}>
          <h2 style={sectionH2}>Голмайстори</h2>
          <a style={sectionLink} onClick={() => navigate("golmaistori")}>Пълна класация →</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.scorers.list.slice(0, 5).map((s, i) => (
            <ScorerRow key={s.player} rank={i + 1} player={s.player} team={s.team} teamBadge={s.teamBadge} goals={s.goals} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StandingsScreen({ data }) {
  return (
    <div style={page}>
      <h1 style={{ fontSize: "var(--text-page-title)", margin: "12px 2px 2px", color: "var(--text-primary)" }}>Класиране</h1>
      <p style={{ color: "var(--text-secondary)", margin: "0 2px 14px", fontSize: 13 }}>Сезон {data.meta.season}</p>
      <StandingsTable rows={data.table} />
    </div>
  );
}

function ScorersScreen({ data }) {
  return (
    <div style={page}>
      <h1 style={{ fontSize: "var(--text-page-title)", margin: "12px 2px 2px", color: "var(--text-primary)" }}>Голмайстори</h1>
      <p style={{ color: "var(--text-secondary)", margin: "0 2px 14px", fontSize: 13 }}>
        Изчислено от {data.scorers.processedMatches}/{data.scorers.totalMatches} изиграни мача
      </p>
      <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--surface-card-border)", background: "var(--surface-card)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-sans)" }}>
          <thead>
            <tr>
              <th style={{ width: 32, padding: "9px 8px", color: "var(--text-secondary)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--surface-card-border)" }}>#</th>
              <th style={{ textAlign: "left", padding: "9px 8px", color: "var(--text-secondary)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--surface-card-border)" }}>Играч</th>
              <th style={{ padding: "9px 8px", color: "var(--text-secondary)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--surface-card-border)" }}>Отбор</th>
              <th style={{ padding: "9px 8px", color: "var(--text-secondary)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--surface-card-border)" }}>Голове</th>
            </tr>
          </thead>
          <tbody>
            {data.scorers.list.map((s, i) => (
              <tr key={s.player} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "9px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-secondary)" }}>{i + 1}</td>
                <td style={{ padding: "9px 8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TeamBadge src={s.teamBadge} name={s.team} size={22} />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.player}</span>
                  </span>
                </td>
                <td style={{ padding: "9px 8px", textAlign: "center", color: "var(--text-secondary)" }}>{s.team}</td>
                <td style={{ padding: "9px 8px", textAlign: "center", fontWeight: 800, color: "var(--text-primary)" }}>{s.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 11, padding: "8px 4px 0" }}>{data.scorers.note}</p>
    </div>
  );
}

window.UIKitScreens = { Home, StandingsScreen, ScorersScreen };
