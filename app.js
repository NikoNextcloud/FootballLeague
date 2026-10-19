const SEASON = "2026-2027";
const CACHE_KEY = "a-grupa-data-v11";
const F = FootballData;
const REFRESH_INTERVAL = 5 * 60_000;
const LIVE_LINKS_KEY = "a-grupa-live-links-v1";

const fallbackTeams = [
  ["Ludogorets", "Лудогорец", "ludogorets.png"], ["Levski Sofia", "Левски", "levski.png"],
  ["CSKA Sofia", "ЦСКА", "cska.png"], ["Cherno More", "Черно море", "cherno-more.png"],
  ["Arda Kardzhali", "Арда", "arda.png"], ["Botev Plovdiv", "Ботев Пловдив", "botev-plovdiv.png"],
  ["Lokomotiv Plovdiv", "Локомотив Пловдив", "lokomotiv-plovdiv.png"], ["CSKA 1948", "ЦСКА 1948", "cska-1948.png"],
  ["Slavia Sofia", "Славия", "slavia.png"], ["Lokomotiv Sofia", "Локомотив София", "lokomotiv-sofia.png"],
  ["Botev Vratsa", "Ботев Враца", "botev-vratsa.jpg"], ["Spartak Varna", "Спартак Варна", "spartak-varna.png"],
  ["Septemvri Sofia", "Септември София", "septemvri-sofia.png"], ["Dunav Ruse", "Дунав Русе", "dunav-ruse.png"]
].map((t, i) => ({ idTeam: `f${i}`, strTeam: t[1], aliases: t[0], strBadge: t[2] ? `assets/teams/${t[2]}` : "" }));

const clubStadiums={"Лудогорец":"Хювефарма Арена","Левски":"Георги Аспарухов","ЦСКА":"Васил Левски","Черно море":"Тича","Арда":"Арена Арда","Ботев Пловдив":"Христо Ботев","Локомотив Пловдив":"Локомотив","ЦСКА 1948":"Витоша","Славия":"Александър Шаламанов","Локомотив София":"Локомотив","Ботев Враца":"Христо Ботев","Спартак Варна":"Спартак","Септември София":"Васил Левски","Дунав Русе":"Градски стадион Русе"};

// Европейските турнири се четат от локалния JSON, генериран от Bulgarian-football bot-а.
const EUROPE_LEAGUES = [
  { test:/champions/i, name:"Шампионска лига", cls:"ucl" },
  { test:/conference/i, name:"Лига на конференциите", cls:"uecl" },
  { test:/europa/i, name:"Лига Европа", cls:"uel" }
];
const euroCompetition = strLeague => EUROPE_LEAGUES.find(c => c.test.test(strLeague || "")) || null;
const state = { page: "home", filter: "all", team: "all", season: SEASON, selectedTeam: null, round: null, editingLiveLink: null,
  europeUpdated:null, europe:[], europeLoaded:false, openMatches:new Set(), loadingDetail:null, data: null, loading: true, refreshError: false, lastFetchAt: 0 };
const $ = (s) => document.querySelector(s);
const escapeHtml = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const num = v => Number(v ?? 0);

function localName(name = "") {
  const found = fallbackTeams.find(t => name.toLowerCase() === t.aliases.toLowerCase() || name.toLowerCase() === t.strTeam.toLowerCase());
  return found?.strTeam || name;
}

function localBadge(name = "", remote = "") {
  const found = fallbackTeams.find(t => localName(name) === t.strTeam);
  return found?.strBadge || (remote ? `${remote}/small` : "assets/logos/icon-192.png");
}

function readStored(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function storeValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browsing still works without persistence. */ }
}
let pendingRefresh = null;
async function loadLocalFile() {
  const response = await fetch(`data/bulgarian-football.json?ts=${Date.now()}`, {
    cache: "no-store", signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const file = await response.json();
  if (!F.validateSnapshot(file)) throw new Error("Невалиден набор от данни");
  const data = convertBulgarianFootballFile(file);
  data.offline = response.headers.get("X-Football-Cache") === "offline" || navigator.onLine === false;
  return data;
}

function convertBulgarianFootballFile(file) {
  const teams = (file.table || []).map((row, index) => {
    const name = localName(row.strTeam);
    const known = fallbackTeams.find(team => team.strTeam === name);
    return { ...known, idTeam: known?.idTeam || `bf-${index}`, strTeam: name,
      strBadge: localBadge(name), strStadium: clubStadiums[name] || "България" };
  });
  const table = (file.table || []).map((row, index) => ({
    ...row,
    idTeam: teams.find(t => localName(t.strTeam) === localName(row.strTeam))?.idTeam || `bf-${index}`,
    strTeam: localName(row.strTeam),
    strBadge: localBadge(row.strTeam)
  }));
  const events = (file.events || []).map(e => ({
    ...e,
    idEvent: e.id || e.idEvent,
    strHomeTeam: localName(e.strHomeTeam),
    strAwayTeam: localName(e.strAwayTeam),
    strHomeTeamBadge: localBadge(e.strHomeTeam),
    strAwayTeamBadge: localBadge(e.strAwayTeam),
    intRound: e.intRound || "",
    intHomeScore: e.intHomeScore ?? null,
    intAwayScore: e.intAwayScore ?? null
  })).sort(F.compareEvents);
  const scorers = (file.scorers || []).map((s, i) => ({
    id: `bf-scorer-${i}`,
    player: s.player,
    team: localName(s.team),
    goals: num(s.goals)
  }));
  return {
    table,
    events,
    teams,
    scorers,
    europe: file.europe || null,
    updatedAt: file.updatedAt,
    lastSuccessAt: file.lastSuccessAt || file.updatedAt,
    season: file.season || SEASON,
    pages: file.pages || {},
    warnings: file.warnings || [],
    integrity: file.integrity || null,
    standingsNotes: file.standingsNotes || file.notes || [],
    offline: false,
    source: file.source || "bulgarian-football.com"
  };
}

async function loadData(force = false) {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    const cached = readStored(CACHE_KEY);
    if (!state.data && F.validateSnapshot(cached,true)) state.data = { ...cached, offline: true };
    state.loading = true;
    if(!state.data) render();
    else { $("#refresh").disabled = true; $("#refresh").classList.add("refreshing"); }
    try {
      state.data = await loadLocalFile();
      state.refreshError = false;
      state.lastFetchAt = Date.now();
      state.europeLoaded = false;
      storeValue(CACHE_KEY, state.data);
    } catch (error) {
      state.refreshError = true;
      if (state.data) state.data = { ...state.data, offline: true };
      else state.data = { table: [], events: [], teams: [], updatedAt: null, offline: true, warnings: [] };
    } finally {
      state.loading = false;
      render({ preserve: true });
    }
  })();
  try { await pendingRefresh; } finally { pendingRefresh = null; }
}

const played = F.played;
const formatDate = event => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.dateEvent || "")) return "Дата предстои";
  const date = new Date(`${event.dateEvent}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return "Дата предстои";
  return new Intl.DateTimeFormat("bg-BG", { timeZone: F.TIME_ZONE, weekday: "short", day: "numeric", month: "short" }).format(date);
};
const formatTime = event => /^\d{1,2}:\d{2}/.test(event.strTime || "") ? event.strTime.slice(0,5) : "Час предстои";
const seasonLabel = () => String(state.data?.season || SEASON).replace(/(\d{4})[-/](\d{4})/, (_, a, b) => `${a}/${b.slice(-2)}`);
function freshnessHtml() {
  const health = F.health(state.data);
  const checked = health.checked ? new Intl.DateTimeFormat("bg-BG", { timeZone: F.TIME_ZONE, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(health.checked)) : "не е налична";
  const source = "https://bulgarian-football.com/parva-liga.html";
  return `<aside class="data-health ${health.level}" aria-label="Състояние на данните"><div><b>${escapeHtml(health.label)}</b><small>${escapeHtml(checked)} · българско време</small></div><div><a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Източник ↗</a><span>Автопроверка при отворено приложение · 5 мин.</span></div></aside>`;
}
function matchState(event) {
  const labels = { postponed: "Отложен", cancelled: "Отменен", abandoned: "Прекратен", suspended: "Прекъснат", awarded: "Служебен резултат" };
  if (labels[event.status]) return labels[event.status];
  if (played(event)) return "Краен резултат";
  const start = F.kickoff(event);
  if (Number.isFinite(start) && start < Date.now()) return "Очаква се резултат";
  return event.dateEvent ? "Предстои" : "Дата предстои";
}

function teamLogo(name, src) { return `<img class="team-logo" src="${escapeHtml(src || localBadge(name))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/logos/icon-192.png'">`; }

// Детайлите идват само от локалните JSON файлове. Не дърпаме външни API-та при клик.
async function loadMatchDetail(idEvent) {
  const ev = state.data.events.find(x => x.idEvent === idEvent);
  if (!ev || ev._detailLoaded) return;
  ev._detailLoaded = true;
  ev.goals = ev.goals || []; ev.cards = ev.cards || [];
}

function matchDetailHtml(e) {
  if (state.loadingDetail === e.idEvent && !e.goals && !e.cards) return `<p class="md-empty">Зареждаме статистиката…</p>`;
  const goals = e.goals || [], cards = e.cards || [];
  if (!goals.length && !cards.length) return `<p class="md-empty">Няма подробна статистика за този мач в безплатния източник.</p>`;
  const side = s => {
    const g = goals.filter(x => x.side === s).map(x =>
      `<li class="md-goal"><b>${escapeHtml(x.minute ? x.minute + "'" : "")}</b><span>⚽</span><span>${escapeHtml(x.player || "Гол")}${x.penalty ? " <em>(дузпа)</em>" : x.own ? " <em>(авт.)</em>" : ""}</span></li>`).join("");
    const c = cards.filter(x => x.side === s).map(x =>
      `<li class="md-card"><b>${escapeHtml(x.minute ? x.minute + "'" : "")}</b><span>${x.red ? "🟥" : "🟨"}</span><span>${escapeHtml(x.player || "")}</span></li>`).join("");
    return `<ul class="md-list">${g}${c || (g ? "" : "<li class='md-empty'>—</li>")}</ul>`;
  };
  return `<div class="md-grid"><div class="md-col">${side("H")}</div><div class="md-col md-away">${side("A")}</div></div>`;
}

function matchCard(e) {
  const isPlayed = played(e);
  const score = isPlayed ? `<strong class="score">${escapeHtml(e.intHomeScore)}<span>:</span>${escapeHtml(e.intAwayScore)}</strong>` : `<strong class="kickoff ${!e.strTime ? "time-pending" : ""}">${formatTime(e)}</strong>`;
  const open = isPlayed && state.openMatches.has(e.idEvent);
  const toggle = isPlayed ? `<button class="detail-toggle" aria-expanded="${open}" data-detail="${escapeHtml(e.idEvent)}">${open ? "Скрий статистиката ▴" : "Голове и картони ▾"}</button>` : "";
  const detail = open ? `<div class="match-detail">${matchDetailHtml(e)}</div>` : "";
  return `<article class="match-card${open ? " open" : ""}">
    <div class="match-meta"><span>Кръг ${escapeHtml(e.intRound || "—")} · ${escapeHtml(matchState(e))}</span><time>${formatDate(e)}</time></div>
    <div class="match-team home"><b>${escapeHtml(e.strHomeTeam)}</b>${teamLogo(e.strHomeTeam,e.strHomeTeamBadge)}</div>
    ${score}
    <div class="match-team away">${teamLogo(e.strAwayTeam,e.strAwayTeamBadge)}<b>${escapeHtml(e.strAwayTeam)}</b></div>
    ${toggle}
    ${detail}
  </article>`;
}

function standings(rows, compact = false) {
  if (!rows.length) return empty("Класирането още не е публикувано от източника.");
  const list = compact ? rows.slice(0,6) : rows;
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Класиране — всички показатели"><table><thead><tr><th>#</th><th>Отбор</th><th>М</th><th>ГР</th><th>Т</th></tr></thead><tbody>${list.map(r => { const trend=teamTrend(r); return `<tr>
    <td><span class="rank rank-${r.intRank}">${r.intRank}</span></td><td><div class="table-team">${teamLogo(r.strTeam,r.strBadge)}<span>${escapeHtml(r.strTeam)}</span>${trend.icon ? `<i class="trend ${trend.type}" title="${trend.label}">${trend.icon}</i>` : ""}</div></td>
    <td>${r.intPlayed || 0}</td><td>${num(r.intGoalDifference) > 0 ? "+" : ""}${r.intGoalDifference || 0}</td><td><b>${r.intPoints || 0}</b></td></tr>`; }).join("")}</tbody></table></div>`;
}

function teamTrend(row) {
  const old = Number(row.previousRank);
  if (!Number.isFinite(old) || !old) return {type:"same",icon:"",label:"Няма потвърдена предишна позиция"};
  return old === num(row.intRank) ? {type:"same",icon:"→",label:"Без промяна спрямо предишната таблица"}
    : old > num(row.intRank) ? {type:"up",icon:"↑",label:"Изкачва се спрямо предишната таблица"}
    : {type:"down",icon:"↓",label:"Пада спрямо предишната таблица"};
}

function empty(text) { return `<div class="empty"><span>⚽</span><b>${escapeHtml(text)}</b><small>Опитай отново след малко.</small></div>`; }
function sectionTitle(kicker, title, action = "") { return `<div class="section-head"><div><small>${kicker}</small><h2>${title}</h2></div>${action}</div>`; }

function home() {
  const data = state.data;
  const upcoming = data.events.filter(event => F.upcoming(event)).sort(F.compareEvents).slice(0,4);
  const results = data.events.filter(played).sort(F.compareEvents).slice(-4).reverse();
  const leader = data.table[0];
  const completed = data.events.filter(played).length;
  const hero = `<section class="hero">
    <div class="hero-copy"><span class="eyebrow"><i></i> ПЪРВА ЛИГА · ${escapeHtml(seasonLabel())}</span><h1>Твоят поглед към<br><em>българския футбол.</em></h1><p class="hero-description">Програмата, резултатите и класирането. Всичко важно за отбора, който следваш.</p><div class="hero-actions"><button class="text-btn" data-page="matches">Виж програмата →</button><a href="https://www.aiscore.com/tournament-bulgarian-first-league/w34kgmiolt1ko92" target="_blank" rel="noopener noreferrer">Резултати на живо ↗</a></div><div class="hero-kpis"><div class="hero-kpi"><b>${data.teams.length || "—"}</b><span>отбора</span></div><div class="hero-kpi"><b>${completed}</b><span>изиграни мача</span></div><div class="hero-kpi"><b>${upcoming.length ? formatDayShort(upcoming[0]) : "—"}</b><span>следващ мач</span></div></div></div>
    <div class="hero-stat"><small>НА ВЪРХА</small>${leader ? `${teamLogo(leader.strTeam,leader.strBadge)}<b>${escapeHtml(leader.strTeam)}</b><strong>${escapeHtml(leader.intPoints)} <small>точки</small></strong><span>${escapeHtml(leader.intPlayed)} изиграни мача</span>` : `<b>Очакваме данни</b>`}</div>
  </section>`;
  return `${hero}
  ${teamsMarquee(data.teams)}
  <section>${sectionTitle("СЛЕДВАЩИЯТ СЪДИЙСКИ СИГНАЛ", "Предстоящи мачове", `<button data-page="matches" class="text-btn">Цялата програма →</button>`)}<div class="match-grid">${upcoming.length ? upcoming.map(matchCard).join("") : empty("Няма потвърдени предстоящи мачове в източника.")}</div></section>
  <section class="split"><div>${sectionTitle("БИТКАТА ЗА ВЪРХА", "Класиране", `<button data-page="standings" class="text-btn">Всички отбори →</button>`)}${standings(data.table,true)}</div>
  <div>${sectionTitle("ПОСЛЕДНИЯТ СИГНАЛ", "Резултати", `<button data-page="matches" class="text-btn">Всички →</button>`)}<div class="results-list">${results.length ? results.map(matchCard).join("") : empty("Няма налични резултати.")}</div></div></section>`;
}

function teamsMarquee(teams) {
  const items=[...teams,...teams].map(t=>`<button class="crest-item" data-team="${escapeHtml(t.idTeam)}" title="${escapeHtml(t.strTeam)}">${teamLogo(t.strTeam,t.strBadge)}<span>${escapeHtml(t.strTeam)}</span></button>`).join("");
  return `<div class="crest-marquee" aria-label="Отбори в А Група"><div class="crest-track">${items}</div></div>`;
}

function formatDayShort(e) {
  if (!e.dateEvent) return "";
  const [, m, d] = e.dateEvent.split("-");
  return `${d}.${m}`;
}

function roundDateRange(roundEvents) {
  const dates = roundEvents.map(e => e.dateEvent).filter(Boolean).sort();
  if (!dates.length) return "";
  const fmt = ds => new Intl.DateTimeFormat("bg-BG", { timeZone:F.TIME_ZONE, day: "numeric", month: "short" }).format(new Date(`${ds}T12:00:00Z`));
  return dates[0] === dates[dates.length - 1] ? fmt(dates[0]) : `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

function defaultRound(events, rounds) {
  const upcoming = events.filter(e => F.upcoming(e) && num(e.intRound) > 0)
    .sort((a, b) => `${a.dateEvent}`.localeCompare(`${b.dateEvent}`));
  if (state.filter !== "results" && upcoming.length) return num(upcoming[0].intRound);
  const playedRounds = events.filter(played).map(e => num(e.intRound)).filter(Boolean);
  return playedRounds.length ? Math.max(...playedRounds) : rounds[0];
}

// Един ред за мач (като на efbet): дата · домакин · резултат/час · гост.
function roundRow(e) {
  const isPlayed = played(e);
  const mid = isPlayed
    ? `<strong class="rr-score">${escapeHtml(e.intHomeScore)}<span>:</span>${escapeHtml(e.intAwayScore)}</strong>`
    : `<strong class="rr-time ${!e.strTime ? "time-pending" : ""}">${["postponed","cancelled","abandoned","suspended"].includes(e.status) ? escapeHtml(matchState(e)) : formatTime(e)}</strong>`;
  const open = isPlayed && state.openMatches.has(e.idEvent);
  const row = `<div class="round-row${isPlayed ? " rr-clickable" : ""}${open ? " open" : ""}"${isPlayed ? ` role="button" tabindex="0" aria-expanded="${open}" aria-label="${escapeHtml(e.strHomeTeam)} – ${escapeHtml(e.strAwayTeam)}, ${escapeHtml(e.intHomeScore)}:${escapeHtml(e.intAwayScore)}, статистика" data-detail="${escapeHtml(e.idEvent)}"` : ""}>
    <span class="rr-date" title="${escapeHtml(matchState(e))}">${escapeHtml(formatDayShort(e))}</span>
    <div class="rr-team rr-home"><b>${escapeHtml(e.strHomeTeam)}</b>${teamLogo(e.strHomeTeam, e.strHomeTeamBadge)}</div>
    ${mid}
    <div class="rr-team rr-away">${teamLogo(e.strAwayTeam, e.strAwayTeamBadge)}<b>${escapeHtml(e.strAwayTeam)}</b></div>
  </div>`;
  const detail = open ? `<div class="match-detail rr-detail">${matchDetailHtml(e)}</div>` : "";
  return `<div class="rr-wrap">${row}${detail}</div>`;
}

function matches() {
  const allEvents = state.data.events || [];
  const events = allEvents.filter(event => state.team === "all" || event.strHomeTeam === state.team || event.strAwayTeam === state.team);
  const rounds = [...new Set(events.map(e => num(e.intRound)).filter(n => n > 0))].sort((a, b) => a - b);
  if (!rounds.length) {
    return `<section class="page-intro"><span class="eyebrow">ПРОГРАМА И РЕЗУЛТАТИ</span><h1>Мачове</h1></section>
    <div class="match-grid page-grid">${events.length ? events.map(matchCard).join("") : empty("Няма мачове.")}</div>`;
  }
  const totalRounds = rounds[rounds.length - 1];
  if (state.round == null || !rounds.includes(state.round)) state.round = defaultRound(events, rounds);
  const cur = state.round;
  const roundEvents = events.filter(e => num(e.intRound) === cur && (state.filter === "all" || (state.filter === "results" ? played(e) : F.upcoming(e))))
    .sort((a, b) => `${a.dateEvent}${a.strTime || ""}`.localeCompare(`${b.dateEvent}${b.strTime || ""}`));
  const idx = rounds.indexOf(cur);
  const prev = idx > 0 ? rounds[idx - 1] : null;
  const next = idx < rounds.length - 1 ? rounds[idx + 1] : null;
  const range = roundDateRange(roundEvents);
  return `<section class="page-intro"><span class="eyebrow">ПРОГРАМА И РЕЗУЛТАТИ</span><h1>Мачове</h1><p>Разгледай мачовете по кръгове. Кликни изигран мач за голове и картони.</p></section>
  <div class="match-filters"><label>Отбор <select id="team-filter"><option value="all">Всички отбори</option>${state.data.teams.map(team => `<option value="${escapeHtml(team.strTeam)}"${state.team === team.strTeam ? " selected" : ""}>${escapeHtml(team.strTeam)}</option>`).join("")}</select></label><label>Кръг <select id="round-select">${rounds.map(round => `<option value="${round}"${cur===round?" selected":""}>Кръг ${round}</option>`).join("")}</select></label><div class="filter-chips" role="group" aria-label="Вид мачове">${[["all","Всички"],["upcoming","Предстоящи"],["results","Резултати"]].map(([key,label])=>`<button class="chip ${state.filter===key?"active":""}" data-filter="${key}" aria-pressed="${state.filter===key}">${label}</button>`).join("")}</div></div>
  <div class="round-nav">
    <button class="round-arrow" aria-label="Предишен кръг"${prev == null ? " disabled" : ` data-round="${prev}"`}>‹</button>
    <div class="round-head"><b>Кръг ${cur} от ${totalRounds}</b>${range ? `<small>${range}</small>` : ""}</div>
    <button class="round-arrow" aria-label="Следващ кръг"${next == null ? " disabled" : ` data-round="${next}"`}>›</button>
  </div>
  <div class="round-list">${roundEvents.length ? roundEvents.map(roundRow).join("") : empty("Няма мачове за избрания кръг и филтър.")}</div>`;
}

function teams() {
  return `<section class="page-intro"><span class="eyebrow">КЛУБОВЕТЕ</span><h1>Отбори</h1><p>${state.data.teams.length} отбора в българския футболен елит.</p></section>
  <div class="teams-grid">${state.data.teams.map(t => `<button class="team-card" data-team="${escapeHtml(t.idTeam)}">${teamLogo(t.strTeam,t.strBadge)}<div><b>${escapeHtml(t.strTeam)}</b><small>${escapeHtml(t.strStadium || "България")}</small><span>Виж профила →</span></div></button>`).join("")}</div>`;
}

function euroTeam(name) {
  const local = localName(name);
  const club = fallbackTeams.find(t => t.strTeam === local);
  return club ? `${teamLogo(local,club.strBadge)}<b>${escapeHtml(local)}</b>`
    : `<span class="opponent-mark">${escapeHtml(name.split(/\s+/).map(x=>x[0]).slice(0,2).join(""))}</span><b>${escapeHtml(name)}</b>`;
}

function euroTeamWithLogo(name, logo = "") {
  const local = localName(name);
  const club = fallbackTeams.find(t => t.strTeam === local);
  const src = club?.strBadge || logo;
  return src ? `${teamLogo(local || name, src)}<b>${escapeHtml(local || name)}</b>` : euroTeam(name);
}

// Определя турнира (клас + име) от фикстура – работи и с новите (cls), и със стари данни.
function euroCompetitionMeta(fixture) {
  if (fixture.cls) return { cls: fixture.cls, name: fixture.competition };
  const name = fixture.competition || "";
  if (/champions|шампион/i.test(name)) return { cls:"ucl", name };
  if (/conference|конференц/i.test(name)) return { cls:"uecl", name };
  if (/europa|европа/i.test(name)) return { cls:"uel", name };
  return { cls:"uecl", name: name || "Евротурнир" };
}

function europeCard(e) {
  const finished = played({ ...e, intHomeScore:e.homeScore, intAwayScore:e.awayScore });
  const middle = finished ? `<strong class="score">${escapeHtml(e.homeScore)}<span>:</span>${escapeHtml(e.awayScore)}</strong>`
    : `<strong class="kickoff">${escapeHtml(matchState(e)==="Предстои" ? formatTime(e) : matchState(e))}</strong>`;
  const meta = euroCompetitionMeta(e);
  return `<article class="europe-card"><div class="euro-meta"><span class="competition ${meta.cls}">${escapeHtml(meta.name)}</span><span>${escapeHtml(e.round || "")}</span></div><time>${formatDate(e)}</time><div class="euro-teams"><div>${euroTeamWithLogo(e.home, e.homeLogo)}</div>${middle}<div>${euroTeamWithLogo(e.away, e.awayLogo)}</div></div></article>`;
}

function europeGroupsHtml() {
  if (!state.europe.length && !state.europeLoaded) return `<div class="empty"><span>⚽</span><b>Зареждаме евротурнирите…</b><small>Четем локалните данни от bot-а.</small></div>`;
  const html = EUROPE_LEAGUES.map(g => {
    const list = state.europe.filter(e => euroCompetitionMeta(e).cls === g.cls)
      .sort((a,b) => `${a.dateEvent}${a.strTime||""}`.localeCompare(`${b.dateEvent}${b.strTime||""}`));
    if (!list.length) return "";
    return `<section class="euro-section">${sectionTitle("ПРОГРАМА И РЕЗУЛТАТИ", g.name)}<div class="europe-grid">${list.map(europeCard).join("")}</div></section>`;
  }).join("");
  return html || `<div class="empty"><span>⚽</span><b>Няма намерени европейски мачове.</b><small>Българските отбори нямат предстоящи или скорошни мачове в Европа.</small></div>`;
}

function europeParticipantsHtml() {
  const participants = state.data?.europe?.participants || [];
  if (!participants.length) return "";
  return `<section class="euro-section">${sectionTitle("Български отбори", "Участници в Европа")}<div class="euro-participants">${participants.map(item => `<article class="participant-card">${teamLogo(item.team)}<div><span class="competition ${euroCompetitionMeta(item).cls}">${escapeHtml(item.competition)}</span><b>${escapeHtml(item.team)}</b></div></article>`).join("")}</div></section>`;
}

function loadEuropeFromLocal() {
  if (state.europeLoaded) return;
  const source = state.data?.europe || {};
  state.europe = (source.events || []).map(event => {
    const meta = euroCompetition(event.competition || "");
    return {
      id: event.id || event.idEvent,
      competition: event.competition || meta?.name || "Евротурнири",
      cls: meta?.cls || euroCompetitionMeta(event).cls,
      round: event.roundLabel || event.round || "",
      dateEvent: event.dateEvent || "",
      strTime: event.strTime || "",
      home: event.strHomeTeam || event.home || "",
      away: event.strAwayTeam || event.away || "",
      homeScore: event.intHomeScore ?? event.homeScore,
      awayScore: event.intAwayScore ?? event.awayScore,
      status: event.status || ""
    };
  }).filter(event => event.home && event.away);
  state.europeLoaded = true;
  state.europeUpdated = state.data?.pages?.europe?.checkedAt || state.data?.updatedAt || null;
}

function europe() {
  loadEuropeFromLocal();
  return `<section class="page-intro europe-intro"><span class="eyebrow">БЪЛГАРИЯ В ЕВРОПА</span><h1>Евротурнири</h1><p>Мачове и резултати на българските отбори в Шампионска лига, Лига Европа и Лига на конференциите.</p><div class="live-status ${state.data?.pages?.europe?.stale ? "warning" : ""}">Данни от bulgarian-football.com${state.europeUpdated?` · ${new Date(state.europeUpdated).toLocaleString("bg-BG",{timeZone:F.TIME_ZONE,day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`:""}</div></section>
  ${state.data?.pages?.europe?.stale ? `<p class="data-note warning">Европейските данни са запазени от предишна проверка. Източникът временно е недостъпен.</p>` : ""}
  ${europeParticipantsHtml()}
  <section class="euro-shortcuts">
    <a href="https://www.uefa.com/uefachampionsleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition ucl">UCL</span><b>Шампионска лига</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaeuropaleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uel">UEL</span><b>Лига Европа</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaconferenceleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uecl">UECL</span><b>Лига на конференциите</b><small>Програма и резултати ↗</small></a>
  </section>
  <div id="europe-results">${europeGroupsHtml()}</div>`;
}

const clubDescriptions={
  "Лудогорец":"Най-успешният български клуб през последното десетилетие и редовен участник в европейските клубни турнири.",
  "Левски":"Един от най-популярните и титулувани български клубове, основан през 1914 година в София.",
  "ЦСКА":"Традиционен столичен гранд с богата история, множество шампионски титли и силно европейско присъствие.",
  "Ботев Пловдив":"Най-старият действащ футболен клуб в България, основан през 1912 година.",
  "Черно море":"Варненски клуб с дългогодишно присъствие в елита и домакински мачове на стадион „Тича“.",
  "Дунав Русе":"Представителят на Русе в елитния футбол, познат с традиции и силна местна подкрепа."
};

function teamProfile() {
  const team=state.data.teams.find(t=>t.idTeam===state.selectedTeam) || state.data.teams.find(t=>t.strTeam===state.selectedTeam);
  if (!team) { state.page="teams"; return teams(); }
  const row=state.data.table.find(r=>r.strTeam===team.strTeam) || {};
  const teamGames=state.data.events.filter(e=>e.strHomeTeam===team.strTeam || e.strAwayTeam===team.strTeam);
  const upcomingGames=teamGames.filter(e=>F.upcoming(e)).sort(F.compareEvents).slice(0,3);
  const recentGames=teamGames.filter(played).sort(F.compareEvents).slice(-3).reverse();
  const games=[...upcomingGames,...recentGames];
  const description=clubDescriptions[team.strTeam] || `${team.strTeam} е част от българския футболен елит през сезон ${seasonLabel()}. Клубът представя своя град в най-високото ниво на българския футбол.`;
  const stats=[[row.intRank||"—","МЯСТО"],[row.intPoints||0,"ТОЧКИ"],[row.intPlayed||0,"МАЧОВЕ"],[row.intWin||0,"ПОБЕДИ"],[row.intDraw||0,"РАВНИ"],[row.intLoss||0,"ЗАГУБИ"]];
  return `<button class="back-btn" data-page="teams">← Всички отбори</button><section class="team-profile">
    <header class="profile-head">${teamLogo(team.strTeam,team.strBadge)}<div><h1>${escapeHtml(team.strTeam)}</h1><p>${escapeHtml(team.strStadium||"България")}</p></div></header>
    <h2>Статистика от сезона</h2><div class="profile-stats">${stats.map(s=>`<div><strong>${s[0]}</strong><small>${s[1]}</small></div>`).join("")}</div>
    <h2>За отбора</h2><p class="team-description">${escapeHtml(description)}</p>
    <h2>Мачове</h2><div class="match-grid">${games.length?games.map(matchCard).join(""):empty("Все още няма публикувани мачове за този отбор.")}</div>
  </section>`;
}

// Published source ordering is retained; the league site is an independent comparison link.
const LIVESCORE_URL = "https://efbetleague.com/standings";
function fullStandings(rows) {
  if (!rows.length) return empty("Класирането още не е налично.");
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Класиране — всички показатели"><table class="full-table"><thead><tr><th>#</th><th>Отбор</th>
    <th title="Изиграни мачове">И</th><th title="Победи">П</th><th title="Равни">Р</th><th title="Загуби">З</th>
    <th title="Вкарани голове">ВГ</th><th title="Допуснати голове">ДГ</th><th title="Голова разлика">ГР</th><th title="Точки">Т</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
    <td><span class="rank rank-${r.intRank}">${r.intRank}</span></td>
    <td><div class="table-team">${teamLogo(r.strTeam, r.strBadge)}<span>${escapeHtml(r.strTeam)}</span></div></td>
    <td>${num(r.intPlayed)}</td><td>${num(r.intWin)}</td><td>${num(r.intDraw)}</td><td>${num(r.intLoss)}</td>
    <td>${num(r.intGoalsFor)}</td><td>${num(r.intGoalsAgainst)}</td>
    <td>${num(r.intGoalDifference) > 0 ? "+" : ""}${num(r.intGoalDifference)}</td><td><b>${num(r.intPoints)}</b></td></tr>`).join("")}</tbody></table></div>`;
}
function livescore() {
  return `<section class="page-intro"><span class="eyebrow">БЪЛГАРСКИЯТ ФУТБОЛЕН ЕЛИТ</span><h1>Класиране</h1><p>Публикуваната таблица за сезон ${escapeHtml(seasonLabel())}. Точките и подреждането се запазват според източника, включително при равенство.</p>
  <a class="ls-open" href="${LIVESCORE_URL}" target="_blank" rel="noopener noreferrer">Сравни с efbet Лига ↗</a></section>
  ${state.data?.integrity?.status === "mismatch" ? `<p class="data-note warning">Публикуваната таблица и наличните резултати временно се различават. Показваме точките и подреждането от източника.</p>` : ""}
  ${fullStandings(state.data?.table || [])}
  <p class="data-note">И — изиграни · П — победи · Р — равни · З — загуби · ВГ/ДГ — голове · ГР — голова разлика · Т — точки. Публикуваните точки могат да включват дисциплинарни корекции. Часовете на мачовете са по българско време.</p>`;
}

const defaultLiveLinks = [
  { id:"default-tv", title:"Основен live портал", url:"https://tvip-7itn.onrender.com/", category:"Футбол", description:"Запазеният досегашен линк от бутона „На живо“." }
];

function readLiveLinks() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIVE_LINKS_KEY) || "null");
    if (Array.isArray(saved)) return saved.filter(link=>link && typeof link.id === "string" && normalizeLiveUrl(link.url));
  } catch {}
  return defaultLiveLinks;
}

function writeLiveLinks(links) {
  storeValue(LIVE_LINKS_KEY, links);
}

function normalizeLiveUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function createLiveLinkId() {
  return globalThis.crypto?.randomUUID?.() || `live-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function liveLinksPage() {
  const links = readLiveLinks();
  const editing = links.find(link => link.id === state.editingLiveLink);
  return `<section class="page-intro live-page-intro"><span class="eyebrow">LIVE TV</span><h1>На живо</h1><p>Добавяй линкове за гледане на мачове, канали или стриймове. Те се пазят в този браузър и са достъпни веднага от приложението.</p></section>
  <section class="live-manager">
    <form id="live-link-form" class="live-form">
      <div class="form-head"><small>${editing ? "Редакция" : "Нов линк"}</small><b>${editing ? "Промени live линка" : "Добави live линк"}</b></div>
      <label>Име на линка<input name="title" required maxlength="80" placeholder="Например: Левски - Лудогорец" value="${escapeHtml(editing?.title || "")}"></label>
      <label>URL адрес<input name="url" required type="text" inputmode="url" placeholder="https://..." value="${escapeHtml(editing?.url || "")}"></label>
      <label>Категория<input name="category" maxlength="40" placeholder="efbet Лига, БНТ, Diema..." value="${escapeHtml(editing?.category || "")}"></label>
      <label>Описание<textarea name="description" maxlength="180" rows="3" placeholder="Кратка бележка за линка">${escapeHtml(editing?.description || "")}</textarea></label>
      <div class="live-form-actions">
        <button class="ls-open" type="submit">${editing ? "Запази промените" : "Добави линк"}</button>
        ${editing ? `<button class="text-btn" id="cancel-live-edit" type="button">Откажи</button>` : ""}
      </div>
    </form>
    <div class="live-library">
      ${sectionTitle("Твоите линкове", "Гледане на живо")}
      <div class="live-links-grid">${links.length ? links.map(link => `<article class="live-card">
        <div><small>${escapeHtml(link.category || "Live")}</small><h2>${escapeHtml(link.title || "Live линк")}</h2><p>${escapeHtml(link.description || "Няма добавено описание.")}</p><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.url)}</a></div>
        <div class="live-card-actions">
          <button class="ls-open" data-live-open="${escapeHtml(link.url)}" type="button">Отвори</button>
          <button class="chip" data-live-edit="${escapeHtml(link.id)}" type="button">Редакция</button>
          <button class="chip danger" data-live-delete="${escapeHtml(link.id)}" type="button">Изтрий</button>
        </div>
      </article>`).join("") : empty("Все още няма добавени live линкове.")}</div>
    </div>
  </section>`;
}

function archive() {
  return `<section class="page-intro"><span class="eyebrow">СЕЗОН</span><h1>${escapeHtml(seasonLabel())}</h1><p>Показваме само публикуваните данни за текущия сезон.</p></section>${fullStandings(state.data.table)}`;
}

function content() {
  if(!state.loading && state.refreshError && !state.data?.table?.length) return `<section class="page-intro"><span class="eyebrow">НЯМА ВРЪЗКА С ДАННИТЕ</span><h1>Временно недостъпни данни.</h1><p>Не успяхме да заредим проверена програма и класиране. Използвай бутона за обновяване горе, за да опиташ отново.</p></section>`;
  if (state.loading && !state.data) return `<div class="loader"><span></span><b>Зареждаме първенството…</b></div>`;
  if (state.page === "standings") return livescore();
  if (state.page === "matches") return matches();
  if (state.page === "teams") return teams();
  if (state.page === "team-detail") return teamProfile();
  if (state.page === "europe") return europe();
  if (state.page === "live") return liveLinksPage();
  if (state.page === "archive") return archive();
  return home();
}

function render({ preserve = false } = {}) {
  // Refreshes preserve in-progress form input and keyboard focus inside the content.
  const active=document.activeElement;
  const activeKey=active?.id || (active?.name ? `[name="${active.name}"]` : "");
  const activeInApp=active && $("#app").contains(active);
  const draft=preserve && $("#live-link-form") ? Object.fromEntries(new FormData($("#live-link-form"))) : null;
  const editingId=state.editingLiveLink;
  $("#app").innerHTML = content() + (state.data ? freshnessHtml() : "");
  if(draft && state.page === "live" && editingId === state.editingLiveLink) {
    for(const [name,value] of Object.entries(draft)) { const field=$("#live-link-form")?.elements.namedItem(name); if(field) field.value=value; }
  }
  if(activeInApp && activeKey) {
    const restored=activeKey.startsWith("[") ? $(activeKey) : document.getElementById(activeKey);
    restored?.focus({preventScroll:true});
  }
  $("#app").setAttribute("aria-busy", String(state.loading));
  $("#refresh").disabled = state.loading;
  $("#refresh").classList.toggle("refreshing", state.loading);
  document.querySelectorAll(".nav-item[data-page]").forEach(el => {
    el.classList.toggle("active", el.dataset.page === state.page);
    if (el.dataset.page === state.page) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  const health = F.health(state.data);
  const status = $("#data-status");
  if (status) {
    status.dataset.health = health.level;
    status.innerHTML = `<i class="${health.level === "fresh" ? "" : "offline"}"></i>${state.loading ? "Проверяваме данните…" : escapeHtml(health.label)}`;
  }
}

// One delegated listener: persistent navigation must not collect handlers on refresh.
document.addEventListener("click", async event => {
  const el = event.target.closest("[data-page], [data-team], [data-detail], [data-filter], [data-round], [data-live-open], [data-live-edit], [data-live-delete], #cancel-live-edit");
  if (!el) return;
  if (el.dataset.page) { state.page = el.dataset.page; scrollTo(0,0); }
  else if (el.dataset.team) { state.selectedTeam=el.dataset.team; state.page="team-detail"; scrollTo(0,0); }
  else if (el.dataset.detail) {
    const id=el.dataset.detail;
    if (state.openMatches.has(id)) state.openMatches.delete(id);
    else { state.openMatches.add(id); await loadMatchDetail(id); }
  }
  else if (el.dataset.filter) { state.filter=el.dataset.filter; state.round=null; }
  else if (el.dataset.round) { state.round=num(el.dataset.round); }
  else if (el.dataset.liveOpen) { const url=normalizeLiveUrl(el.dataset.liveOpen); if(url) window.open(url,"_blank","noopener,noreferrer"); return; }
  else if (el.dataset.liveEdit) state.editingLiveLink=el.dataset.liveEdit;
  else if (el.dataset.liveDelete) {
    if (!confirm("Да изтрия ли този live линк?")) return;
    writeLiveLinks(readLiveLinks().filter(link=>link.id!==el.dataset.liveDelete));
    state.editingLiveLink=null;
  } else state.editingLiveLink=null;
  render();
  if(el.dataset.detail) document.querySelector(`[data-detail="${CSS.escape(el.dataset.detail)}"]`)?.focus({preventScroll:true});
});
document.addEventListener("keydown", event => {
  const el=event.target.closest('.round-row[data-detail]');
  if(el && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); el.click(); }
});
document.addEventListener("change", event => {
  if(event.target.id === "team-filter") { state.team=event.target.value; state.round=null; render(); }
  if(event.target.id === "round-select") { state.round=num(event.target.value); render(); }
});
document.addEventListener("submit", event => {
  if(event.target.id !== "live-link-form") return;
  event.preventDefault();
  const form = new FormData(event.target), url=normalizeLiveUrl(form.get("url"));
  if(!url) return alert("Въведи валиден адрес, започващ с https:// или http://.");
  const links=readLiveLinks();
  const item={id:state.editingLiveLink||createLiveLinkId(),url,title:String(form.get("title")||"").trim()||"Live линк",category:String(form.get("category")||""),description:String(form.get("description")||"")};
  writeLiveLinks(state.editingLiveLink ? links.map(link=>link.id===state.editingLiveLink?item:link) : [item,...links]);
  state.editingLiveLink=null;
  event.target.reset();
  render();
});

function checkMatchNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted" || !state.data?.events || state.data.offline || F.health(state.data).level === "stale") return;
  const stored = readStored("a-grupa-notified", []);
  const sent = new Set(Array.isArray(stored) ? stored : []);
  const now = Date.now();
  state.data.events.filter(e => !played(e)).forEach(e => {
    if (["postponed","cancelled","abandoned","suspended"].includes(e.status)) return;
    const start = F.kickoff(e);
    if (start >= now - 5 * 60_000 && start <= now + 60_000 && !sent.has(e.idEvent)) {
      sendMatchNotification(`${e.strHomeTeam} – ${e.strAwayTeam}`, { body:"Планиран начален час на мача.", tag:`match-start-${e.idEvent}` }).catch(() => {});
      sent.add(e.idEvent);
    }
  });
  storeValue("a-grupa-notified", [...sent].slice(-500));
}

async function sendMatchNotification(title, options={}) {
  const config={...options,icon:"assets/logos/desktop-192.png",badge:"assets/logos/favicon-32.png",data:{url:"./"}};
  if ("serviceWorker" in navigator) {
    const registration=await navigator.serviceWorker.getRegistration();
    if (registration) return registration.showNotification(title,config);
  }
  return new Notification(title,config);
}

$("#refresh").addEventListener("click", () => loadData(true));
$("#notify")?.addEventListener("click", async () => {
  if (!("Notification" in window)) return alert("Този браузър не поддържа известия.");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try { await sendMatchNotification("А Група", { body:"Напомнянията работят, докато приложението е отворено.",tag:"notifications-enabled" }); } catch {}
    $("#notify").classList.add("enabled");
    $("#notify").title="Известията са включени";
  }
});
loadData();
if ("Notification" in window && Notification.permission === "granted") {
  $("#notify")?.classList.add("enabled");
  $("#notify").title="Известията са включени";
}
setInterval(() => { checkMatchNotifications(); if(state.data && !state.loading) renderStatusOnly(); }, 60_000);
function renderStatusOnly() {
  const health=F.health(state.data), status=$("#data-status");
  if(status) { status.dataset.health=health.level; status.innerHTML=`<i class="${health.level==='fresh'?'':'offline'}"></i>${escapeHtml(health.label)}`; }
}
setInterval(() => { if(!document.hidden) loadData(true); }, REFRESH_INTERVAL);
document.addEventListener("visibilitychange", () => { if(!document.hidden && Date.now()-state.lastFetchAt > REFRESH_INTERVAL) loadData(true); });
window.addEventListener("online", () => loadData(true));
window.addEventListener("offline", () => { if(state.data) { state.data.offline=true; render(); } });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("service-worker.js").catch(() => {});
