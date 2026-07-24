const API = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_ID = "4626";
const SEASON = "2026-2027";
const CACHE_KEY = "a-grupa-data-v8";
const EUROPE_CACHE_KEY = "a-grupa-europe-api-football-v1";
const API_FOOTBALL_BASE = `${location.origin}/api-football`;
const API_FOOTBALL_SEASON = Number(SEASON.slice(0, 4));

const fallbackTeams = [
  ["Ludogorets", "Лудогорец", "ludogorets.png"], ["Levski Sofia", "Левски", "levski.png"],
  ["CSKA Sofia", "ЦСКА", "cska.png"], ["Cherno More", "Черно море", "cherno-more.png"],
  ["Arda Kardzhali", "Арда", "arda.png"], ["Botev Plovdiv", "Ботев Пловдив", "botev-plovdiv.png"],
  ["Lokomotiv Plovdiv", "Локомотив Пловдив", "lokomotiv-plovdiv.png"], ["CSKA 1948", "ЦСКА 1948", "cska-1948.png"],
  ["Slavia Sofia", "Славия", "slavia.png"], ["Lokomotiv Sofia", "Локомотив София", "lokomotiv-sofia.png"],
  ["Botev Vratsa", "Ботев Враца", "botev-vratsa.jpg"], ["Spartak Varna", "Спартак Варна", "spartak-varna.png"],
  ["Septemvri Sofia", "Септември София", "septemvri-sofia.png"], ["Dunav Ruse", "Дунав Русе", "dunav-ruse.png"]
].map((t, i) => ({ idTeam: `f${i}`, strTeam: t[1], aliases: t[0], strBadge: t[2] ? `assets/teams/${t[2]}` : "" }));

const officialUpcoming = [
  ["2026-07-17","16:00:00","Спартак Варна","ЦСКА 1948"], ["2026-07-17","18:15:00","Левски","Дунав Русе"],
  ["2026-07-18","16:00:00","Септември София","Арда"], ["2026-07-18","18:15:00","Лудогорец","Локомотив Пловдив"],
  ["2026-07-19","16:30:00","Ботев Враца","Черно море"], ["2026-07-20","16:15:00","Славия","ЦСКА"],
  ["2026-07-20","18:30:00","Ботев Пловдив","Локомотив София"]
].map((e,i) => ({ idEvent:`official-2026-r1-${i+1}`, dateEvent:e[0], strTime:e[1], strHomeTeam:e[2], strAwayTeam:e[3], intRound:"1", intHomeScore:null, intAwayScore:null }));

const clubStadiums={"Лудогорец":"Хювефарма Арена","Левски":"Георги Аспарухов","ЦСКА":"Васил Левски","Черно море":"Тича","Арда":"Арена Арда","Ботев Пловдив":"Христо Ботев","Локомотив Пловдив":"Локомотив","ЦСКА 1948":"Витоша","Славия":"Александър Шаламанов","Локомотив София":"Локомотив","Ботев Враца":"Христо Ботев","Спартак Варна":"Спартак","Септември София":"Драгалевци","Дунав Русе":"Градски стадион Русе"};

// Европейските турнири на българските отбори се дърпат изцяло автоматично
// (виж refreshEurope / fetchLiveEurope). Групи и български имена:
const EUROPE_LEAGUES = [
  { test:/champions/i, name:"Шампионска лига", cls:"ucl" },
  { test:/conference/i, name:"Лига на конференциите", cls:"uecl" },
  { test:/europa/i, name:"Лига Европа", cls:"uel" }
];
const euroCompetition = strLeague => EUROPE_LEAGUES.find(c => c.test.test(strLeague || "")) || null;
const EUROPE_PARTICIPANTS = [
  { team:"Левски", competition:"Шампионска лига", cls:"ucl", round:"II квалификационен кръг", note:"след победа с общ резултат 5:1 срещу Борац Баня Лука" },
  { team:"ЦСКА", competition:"Лига Европа", cls:"uel", round:"II квалификационен кръг", note:"след победа с общ резултат 5:3 срещу Дери Сити" },
  { team:"Лудогорец", competition:"Лига на конференциите", cls:"uecl", round:"II квалификационен кръг", note:"срещу Апоел Тел Авив" },
  { team:"ЦСКА 1948", competition:"Лига на конференциите", cls:"uecl", round:"II квалификационен кръг", note:"срещу Спартак Търнава" }
];

const state = { page: "home", filter: "all", team: "all", season: SEASON, selectedTeam: null, round: null,
  europeUpdated:null, europe:[], europeLoaded:false, allSportsLive:[], allSportsLiveUpdated:null, allSportsLiveLoading:false,
  openMatches:new Set(), loadingDetail:null, data: null, loading: true };
const $ = (s) => document.querySelector(s);
const escapeHtml = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const num = v => Number(v ?? 0);

function localName(name = "") {
  const found = fallbackTeams.find(t => name.toLowerCase().includes(t.aliases.toLowerCase()) || t.aliases.toLowerCase().includes(name.toLowerCase()));
  return found?.strTeam || name;
}

function localBadge(name = "", remote = "") {
  const found = fallbackTeams.find(t => localName(name) === t.strTeam);
  return found?.strBadge || (remote ? `${remote}/small` : "assets/logos/icon-192.png");
}

async function getJson(path) {
  const response = await fetch(`${API}/${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

async function getLocalJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Local API ${response.status}`);
  return response.json();
}

function calculateStandings(events, teams) {
  const rows = new Map(teams.map(t => [t.strTeam, { idTeam:t.idTeam, strTeam:t.strTeam, strBadge:t.strBadge,
    intPlayed:0, intWin:0, intDraw:0, intLoss:0, intGoalsFor:0, intGoalsAgainst:0, intGoalDifference:0, intPoints:0 }]));
  events.filter(played).forEach(e => {
    const home=rows.get(e.strHomeTeam), away=rows.get(e.strAwayTeam);
    if (!home || !away) return;
    const hs=num(e.intHomeScore), as=num(e.intAwayScore);
    home.intPlayed++; away.intPlayed++; home.intGoalsFor+=hs; home.intGoalsAgainst+=as; away.intGoalsFor+=as; away.intGoalsAgainst+=hs;
    if (hs>as) { home.intWin++; away.intLoss++; home.intPoints+=3; }
    else if (hs<as) { away.intWin++; home.intLoss++; away.intPoints+=3; }
    else { home.intDraw++; away.intDraw++; home.intPoints++; away.intPoints++; }
  });
  return [...rows.values()].map(r => ({...r,intGoalDifference:r.intGoalsFor-r.intGoalsAgainst}))
    .sort((a,b)=>b.intPoints-a.intPoints || b.intGoalDifference-a.intGoalDifference || b.intGoalsFor-a.intGoalsFor)
    .map((r,i)=>({...r,intRank:i+1}));
}

function normalize(tableData, eventData, teamData) {
  let table = (tableData.table || []).map((r, i) => ({
    ...r, intRank: r.intRank || i + 1, strTeam: localName(r.strTeam),
    strBadge: localBadge(r.strTeam, r.strBadge)
  }));
  const events = (eventData.events || []).map(e => ({
    ...e, strHomeTeam: localName(e.strHomeTeam), strAwayTeam: localName(e.strAwayTeam),
    strHomeTeamBadge: localBadge(e.strHomeTeam, e.strHomeTeamBadge),
    strAwayTeamBadge: localBadge(e.strAwayTeam, e.strAwayTeamBadge)
  })).sort((a,b) => `${a.dateEvent}${a.strTime || ""}`.localeCompare(`${b.dateEvent}${b.strTime || ""}`));
  const apiTeams = teamData.teams || [];
  const teams = fallbackTeams.map((club, index) => {
    const api = apiTeams.find(t => localName(t.strTeam) === club.strTeam);
    return { ...club, ...api, idTeam: api?.idTeam || club.idTeam || `f${index}`, strTeam: club.strTeam,
      strBadge: localBadge(club.aliases, api?.strBadge), strStadium: api?.strStadium || clubStadiums[club.strTeam] || "България" };
  });
  // Класирането се смята от реалните резултати (самосъгласувано с мачовете),
  // а само баджът/името се допълват от API таблицата. Така подредбата винаги
  // отговаря на изиграните мачове.
  if (events.length) {
    const official = new Map(table.map(r => [r.strTeam, r]));
    table = calculateStandings(events, teams)
      .map(r => ({ ...(official.get(r.strTeam) || {}), ...r }))
      .sort((a,b) => num(b.intPoints)-num(a.intPoints) || num(b.intGoalDifference)-num(a.intGoalDifference) || num(b.intGoalsFor)-num(a.intGoalsFor))
      .map((r,i) => ({ ...r, intRank: i+1 }));
  }
  return { table, events, teams, updatedAt: new Date().toISOString(), live: true };
}

// Генерираният от fetch-data.mjs файл (голове, картони, голмайстори).
async function loadLocalFile() {
  try {
    const r = await fetch(`data/${SEASON}.json?ts=${Date.now()}`, { cache: "no-store" });
    if (r.ok) return await r.json();
  } catch {}
  return null;
}

// Прикача подробности (голове/картони) и голмайстори от файла към живите данни.
function enrichWithFile(normalized, file) {
  if (!file) return normalized;
  const byId = new Map((file.events || []).map(e => [e.idEvent, e]));
  normalized.events.forEach(e => {
    const f = byId.get(e.idEvent);
    if (f && f.goals) e.goals = f.goals;
    if (f && f.cards) e.cards = f.cards;
  });
  if (file.scorers && file.scorers.length) normalized.scorers = file.scorers;
  return normalized;
}

async function loadData(force = false) {
  state.loading = true; render();
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  if (!force && cached && Date.now() - new Date(cached.updatedAt).getTime() < 15 * 60_000) {
    state.data = cached; state.loading = false; render(); return;
  }
  const file = await loadLocalFile();
  try {
    const [table, events, nextEvents, teams] = await Promise.all([
      getJson(`lookuptable.php?l=${LEAGUE_ID}&s=${SEASON}`),
      getJson(`eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`),
      getJson(`eventsnextleague.php?id=${LEAGUE_ID}`),
      getJson(`lookup_all_teams.php?id=${LEAGUE_ID}`)
    ]);
    const knownIds = new Set((events.events || []).map(e => e.idEvent));
    (nextEvents.events || []).forEach(e => { if (!knownIds.has(e.idEvent)) (events.events ||= []).push(e); });
    // Реалните API мачове (с резултати) са с приоритет; хардкоднатите фикстури
    // се добавят САМО ако същата двойка отбори липсва в API-то.
    events.events ||= [];
    const covered = new Set(events.events.map(e => `${localName(e.strHomeTeam)}|${localName(e.strAwayTeam)}`));
    officialUpcoming.forEach(o => { if (!covered.has(`${o.strHomeTeam}|${o.strAwayTeam}`)) events.events.push(o); });
    state.data = enrichWithFile(normalize(table, events, teams), file);
    localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
  } catch (error) {
    // API недостъпен → показваме локалния файл от fetch-data.mjs, после кеша
    let localData = null;
    if (file) localData = enrichWithFile(normalize({ table: file.table }, { events: file.events }, { teams: file.teams }), file);
    state.data = localData || cached || { table: [], events: [], teams: fallbackTeams, updatedAt: new Date().toISOString(), live: false };
    state.data.live = false;
  }
  state.loading = false; render();
}

const played = e => e.intHomeScore !== null && e.intHomeScore !== "" && e.intHomeScore !== undefined;
const formatDate = e => new Intl.DateTimeFormat("bg-BG", { weekday:"short", day:"numeric", month:"short" }).format(new Date(`${e.dateEvent}T${e.strTime || "12:00"}`));
const formatTime = e => (e.strTime || "").slice(0,5) || "—";

function teamLogo(name, src) { return `<img class="team-logo" src="${escapeHtml(src || localBadge(name))}" alt="" loading="lazy" onerror="this.src='assets/logos/icon-192.png'">`; }

// ---- Таймлайн (голове и картони) от TheSportsDB ----
function parseTimeline(timeline = [], event = {}) {
  const goals = [], cards = [];
  const homeName = (event.strHomeTeam || "").toLowerCase();
  for (const item of timeline) {
    const type = `${item.strTimeline || item.strTimelineType || item.strEvent || ""}`.toLowerCase();
    const detail = `${item.strTimelineDetail || ""}`.toLowerCase();
    const player = item.strPlayer || item.strPlayerName || "";
    const minute = `${item.intTime ?? ""}`.replace(/[^0-9+]/g, "");
    let side = item.strHome === "Yes" ? "H" : item.strHome === "No" ? "A" : null;
    if (!side && item.strTeam) side = item.strTeam.toLowerCase() === homeName ? "H" : "A";
    if (!side) side = "H";
    if (type.includes("card")) { cards.push({ side, player, minute, red: type.includes("red") }); continue; }
    const missed = type.includes("miss") || detail.includes("miss") || type.includes("saved");
    if (!((type.includes("goal") || type.includes("penalty")) && !missed)) continue;
    const own = type.includes("own");
    const penalty = type.includes("penalty") || detail.includes("penalty");
    goals.push({ side: own ? (side === "H" ? "A" : "H") : side, player, minute, penalty, own });
  }
  return { goals, cards };
}

// Резервен разбор от текстовите полета на мача (strHomeGoalDetails и т.н.).
function parseDetailString(str) {
  return String(str || "").split(";").map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/(\d+)['’]?\s*[:.\-]?\s*(.*)$/);
    return { minute: m ? m[1] : "", player: (m ? m[2] : s).trim() };
  }).filter(x => x.player);
}
function parseEventDetails(ev = {}) {
  const goals = [], cards = [];
  parseDetailString(ev.strHomeGoalDetails).forEach(g => goals.push({ side: "H", player: g.player, minute: g.minute, penalty: /pen/i.test(g.player), own: /o\.?g|own/i.test(g.player) }));
  parseDetailString(ev.strAwayGoalDetails).forEach(g => goals.push({ side: "A", player: g.player, minute: g.minute, penalty: /pen/i.test(g.player), own: /o\.?g|own/i.test(g.player) }));
  parseDetailString(ev.strHomeRedCards).forEach(c => cards.push({ side: "H", player: c.player, minute: c.minute, red: true }));
  parseDetailString(ev.strAwayRedCards).forEach(c => cards.push({ side: "A", player: c.player, minute: c.minute, red: true }));
  parseDetailString(ev.strHomeYellowCards).forEach(c => cards.push({ side: "H", player: c.player, minute: c.minute, red: false }));
  parseDetailString(ev.strAwayYellowCards).forEach(c => cards.push({ side: "A", player: c.player, minute: c.minute, red: false }));
  return { goals, cards };
}

function parseAllSportsEvents(match = {}) {
  const goals = [], cards = [];
  const add = (side, item = {}) => {
    const type = `${item.type || ""}`.toLowerCase();
    const player = item.player || item.player_name || item.event_player || "";
    const minute = `${item.time || item.minute || item.event_time || ""}`.replace(/[^0-9+]/g, "");
    if (type.includes("goal")) goals.push({ side, player, minute, penalty:/pen/i.test(type), own:/own/i.test(type) });
    if (type.includes("card")) cards.push({ side, player, minute, red:type.includes("red") });
  };
  (match.goalscorers || []).forEach(g => {
    if (g.home_scorer) goals.push({ side:"H", player:g.home_scorer, minute:g.time || "", penalty:/pen/i.test(g.info || ""), own:/own/i.test(g.info || "") });
    if (g.away_scorer) goals.push({ side:"A", player:g.away_scorer, minute:g.time || "", penalty:/pen/i.test(g.info || ""), own:/own/i.test(g.info || "") });
  });
  (match.cards || []).forEach(c => {
    if (c.home_fault) cards.push({ side:"H", player:c.home_fault, minute:c.time || "", red:/red/i.test(c.card || "") });
    if (c.away_fault) cards.push({ side:"A", player:c.away_fault, minute:c.time || "", red:/red/i.test(c.card || "") });
  });
  (match.event || match.events || []).forEach(item => add(item.home_scorer || item.home_fault ? "H" : "A", item));
  return { goals, cards };
}

function mapAllSportsStats(match = {}) {
  const stats = match.statistics || match.stats || [];
  return Array.isArray(stats) ? stats.map(s => ({
    type: s.type || s.stat_type || "",
    home: s.home ?? s.home_stat ?? "",
    away: s.away ?? s.away_stat ?? ""
  })).filter(s => s.type) : [];
}

async function loadAllSportsDetail(ev) {
  if (!ev || ev._allSportsLoaded) return;
  ev._allSportsLoaded = true;
  try {
    const params = new URLSearchParams({ date:ev.dateEvent || "", home:ev.strHomeTeam || "", away:ev.strAwayTeam || "" });
    const data = await getLocalJson(`/allsports/match?${params}`);
    const match = data.match || {};
    const parsed = parseAllSportsEvents(match);
    if (parsed.goals.length && !(ev.goals || []).length) ev.goals = parsed.goals;
    if (parsed.cards.length && !(ev.cards || []).length) ev.cards = parsed.cards;
    ev.allSportsStats = mapAllSportsStats(match);
    ev.allSportsVideos = (data.videos || []).map(v => ({ title:v.video_title_full || v.video_title || "Видео", url:v.video_url })).filter(v => v.url);
    ev.allSportsMeta = {
      stadium: match.event_stadium || "",
      referee: match.event_referee || "",
      status: match.event_status || "",
      league: match.league_name || ""
    };
  } catch {}
}

// Ленив зареждач – при отваряне на мач дърпа таймлайна, после (ако е празен)
// пробва пълните данни на мача. Кешира резултата върху събитието.
async function loadMatchDetail(idEvent) {
  const ev = state.data.events.find(x => x.idEvent === idEvent);
  if (!ev || ev._detailLoaded) return;
  ev._detailLoaded = true;
  ev.goals = ev.goals || []; ev.cards = ev.cards || [];
  try {
    const res = await getJson(`lookuptimeline.php?id=${idEvent}`);
    const t = parseTimeline(res.timeline || [], ev);
    if (t.goals.length || t.cards.length) { ev.goals = t.goals; ev.cards = t.cards; }
  } catch {}
  if (!(ev.goals || []).length && !(ev.cards || []).length) try {
    const res = await getJson(`lookupevent.php?id=${idEvent}`);
    const full = (res.events || [])[0];
    if (full) { const d = parseEventDetails(full); ev.goals = d.goals; ev.cards = d.cards; }
  } catch {}
  await loadAllSportsDetail(ev);
}

function matchDetailHtml(e) {
  if (state.loadingDetail === e.idEvent && !e.goals && !e.cards && !e.allSportsStats) return `<p class="md-empty">Зареждаме статистиката…</p>`;
  const goals = e.goals || [], cards = e.cards || [];
  const stats = e.allSportsStats || [], videos = e.allSportsVideos || [];
  const side = s => {
    const g = goals.filter(x => x.side === s).map(x =>
      `<li class="md-goal"><b>${escapeHtml(x.minute ? x.minute + "'" : "")}</b><span>⚽</span><span>${escapeHtml(x.player || "Гол")}${x.penalty ? " <em>(дузпа)</em>" : x.own ? " <em>(авт.)</em>" : ""}</span></li>`).join("");
    const c = cards.filter(x => x.side === s).map(x =>
      `<li class="md-card"><b>${escapeHtml(x.minute ? x.minute + "'" : "")}</b><span>${x.red ? "🟥" : "🟨"}</span><span>${escapeHtml(x.player || "")}</span></li>`).join("");
    return `<ul class="md-list">${g}${c || (g ? "" : "<li class='md-empty'>—</li>")}</ul>`;
  };
  const timeline = (goals.length || cards.length) ? `<div class="md-grid"><div class="md-col">${side("H")}</div><div class="md-col md-away">${side("A")}</div></div>` : `<p class="md-empty">Няма голове или картони от източника.</p>`;
  const statsHtml = stats.length ? `<div class="md-stats">${stats.slice(0,10).map(s => `<div><span>${escapeHtml(s.home)}</span><b>${escapeHtml(s.type)}</b><span>${escapeHtml(s.away)}</span></div>`).join("")}</div>` : "";
  const videoHtml = videos.length ? `<div class="md-videos">${videos.slice(0,4).map(v => `<a href="${escapeHtml(v.url)}" target="_blank" rel="noopener">${escapeHtml(v.title)} ↗</a>`).join("")}</div>` : "";
  const meta = e.allSportsMeta;
  const metaHtml = meta && (meta.stadium || meta.referee || meta.status) ? `<div class="md-meta">${[meta.status, meta.stadium, meta.referee].filter(Boolean).map(escapeHtml).join(" · ")}</div>` : "";
  if (!goals.length && !cards.length && !stats.length && !videos.length && !metaHtml) return `<p class="md-empty">Няма подробна статистика за този мач в наличните източници.</p>`;
  return `${metaHtml}${timeline}${statsHtml}${videoHtml}`;
}

function matchCard(e) {
  const isPlayed = played(e);
  const score = isPlayed ? `<strong class="score">${escapeHtml(e.intHomeScore)}<span>:</span>${escapeHtml(e.intAwayScore)}</strong>` : `<strong class="kickoff">${formatTime(e)}</strong>`;
  const open = isPlayed && state.openMatches.has(e.idEvent);
  const toggle = isPlayed ? `<button class="detail-toggle" data-detail="${escapeHtml(e.idEvent)}">${open ? "Скрий статистиката ▴" : "Голове и картони ▾"}</button>` : "";
  const detail = open ? `<div class="match-detail">${matchDetailHtml(e)}</div>` : "";
  return `<article class="match-card${open ? " open" : ""}">
    <div class="match-meta"><span>Кръг ${escapeHtml(e.intRound || "—")}</span><time>${formatDate(e)}</time></div>
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
  return `<div class="table-wrap"><table><thead><tr><th>#</th><th>Отбор</th><th>М</th><th>ГР</th><th>Т</th></tr></thead><tbody>${list.map(r => { const trend=teamTrend(r); return `<tr>
    <td><span class="rank rank-${r.intRank}">${r.intRank}</span></td><td><div class="table-team">${teamLogo(r.strTeam,r.strBadge)}<span>${escapeHtml(r.strTeam)}</span><i class="trend ${trend.type}" title="${trend.label}">${trend.icon}</i></div></td>
    <td>${r.intPlayed || 0}</td><td>${num(r.intGoalDifference) > 0 ? "+" : ""}${r.intGoalDifference || 0}</td><td><b>${r.intPoints || 0}</b></td></tr>`; }).join("")}</tbody></table></div>`;
}

function teamTrend(row) {
  const playedEvents=(state.data?.events || []).filter(played);
  const rounds=playedEvents.map(e=>num(e.intRound)).filter(Boolean);
  if (!rounds.length) return {type:"same",icon:"→",label:"Запазва позицията си"};
  const lastRound=Math.max(...rounds);
  const previous=calculateStandings(playedEvents.filter(e=>num(e.intRound)<lastRound),state.data.teams);
  const old=previous.find(r=>r.strTeam===row.strTeam)?.intRank;
  if (!old || old===num(row.intRank)) return {type:"same",icon:"→",label:"Запазва позицията си"};
  return old>num(row.intRank) ? {type:"up",icon:"↑",label:"Изкачва се"} : {type:"down",icon:"↓",label:"Пада в класирането"};
}

function empty(text) { return `<div class="empty"><span>⚽</span><b>${escapeHtml(text)}</b><small>Опитай отново след малко.</small></div>`; }
function sectionTitle(kicker, title, action = "") { return `<div class="section-head"><div><small>${kicker}</small><h2>${title}</h2></div>${action}</div>`; }

async function refreshAllSportsLive(force = false) {
  const now = Date.now();
  if (state.allSportsLiveLoading) return;
  if (!force && state.allSportsLiveUpdated && now - new Date(state.allSportsLiveUpdated).getTime() < 45_000) return;
  state.allSportsLiveLoading = true;
  try {
    const data = await getLocalJson("/allsports/live");
    state.allSportsLive = data.response || [];
    state.allSportsLiveUpdated = new Date().toISOString();
  } catch {
    state.allSportsLive = state.allSportsLive || [];
  }
  state.allSportsLiveLoading = false;
  if (state.page === "home") render();
}

function allSportsLiveCard(match) {
  const score = match.score ? `<strong class="score">${escapeHtml(match.score.replace(" - ", ":"))}</strong>` : `<strong class="live-pill">НА ЖИВО</strong>`;
  return `<article class="live-match-card">
    <div class="match-meta"><span>${escapeHtml(match.league || match.country || "Live")}</span><time>${escapeHtml(match.status || match.strTime || "")}</time></div>
    <div class="match-team home"><b>${escapeHtml(match.home)}</b>${teamLogo(match.home, match.homeLogo)}</div>
    ${score}
    <div class="match-team away">${teamLogo(match.away, match.awayLogo)}<b>${escapeHtml(match.away)}</b></div>
  </article>`;
}

function allSportsLiveSection() {
  const updated = state.allSportsLiveUpdated ? ` · ${new Date(state.allSportsLiveUpdated).toLocaleTimeString("bg-BG",{hour:"2-digit",minute:"2-digit"})}` : "";
  const action = `<button class="text-btn" id="refresh-live">Обнови${updated}</button>`;
  if (state.allSportsLiveLoading && !state.allSportsLive.length) return `<section>${sectionTitle("ALLSPORTSAPI", "Live мачове", action)}${empty("Проверяваме мачовете на живо.")}</section>`;
  return `<section>${sectionTitle("ALLSPORTSAPI", "Live мачове", action)}<div class="live-match-grid">${state.allSportsLive.length ? state.allSportsLive.map(allSportsLiveCard).join("") : empty("В момента няма live мачове за българските отбори в AllSportsAPI.")}</div></section>`;
}

function home() {
  const data = state.data; const now = new Date();
  const upcoming = data.events.filter(e => !played(e) && new Date(e.dateEvent) >= new Date(now.toDateString())).slice(0,4);
  const results = data.events.filter(played).slice(-4).reverse();
  const currentMatches = upcoming.length ? upcoming : results;
  const leader = data.table[0];
  const liveDomestic = data.events.find(isDomesticMatchLive);
  const hero = liveDomestic ? aiscoreLiveHero(liveDomestic) : `<section class="hero">
    <div class="hero-copy"><span class="eyebrow"><i></i> Сезон 2026/27</span><h1>Всичко важно от<br><em>българския елитен футбол</em></h1></div>
    <div class="hero-stat"><small>Лидер</small>${leader ? `${teamLogo(leader.strTeam,leader.strBadge)}<b>${escapeHtml(leader.strTeam)}</b><strong>${leader.intPoints} т.</strong>` : `<b>Очакваме данни</b>`}</div>
  </section>`;
  return `${hero}
  ${teamsMarquee(data.teams)}
  ${allSportsLiveSection()}
  <section>${sectionTitle("НА ФОКУС", "Предстоящи мачове", `<button data-page="matches" class="text-btn">Всички →</button>`)}<div class="match-grid">${upcoming.length ? upcoming.map(matchCard).join("") : empty("Програмата за следващия сезон още не е публикувана в API.")}</div></section>
  <section class="split"><div>${sectionTitle("ПОДРЕЖДАНЕ", "Класиране", `<button data-page="standings" class="text-btn">Пълно →</button>`)}${standings(data.table)}</div>
  <div>${sectionTitle("ПОСЛЕДНО", "Резултати", `<button data-page="matches" class="text-btn">Още →</button>`)}<div class="results-list">${results.length ? results.map(matchCard).join("") : empty("Няма налични резултати.")}</div></div></section>`;
}

function isDomesticMatchLive(event) {
  if (new URLSearchParams(location.search).has("live-preview")) return event===state.data.events.find(e=>!played(e));
  if (!event?.dateEvent || !event?.strTime || played(event)) return false;
  const start=new Date(`${event.dateEvent}T${event.strTime}`).getTime();
  const now=Date.now();
  return now>=start-5*60_000 && now<=start+165*60_000;
}

function aiscoreLiveHero(event) {
  return `<section class="live-hero"><div class="live-hero-head"><div><span class="live-dot"></span><b>НА ЖИВО · efbet Лига</b><small>${escapeHtml(event.strHomeTeam)} – ${escapeHtml(event.strAwayTeam)}</small></div><a href="https://www.aiscore.com/tournament-bulgarian-first-league/w34kgmiolt1ko92" target="_blank" rel="noopener">Отвори в AiScore ↗</a></div><div id="aiscore-live"><iframe src="https://www.aiscore.com/tournament-bulgarian-first-league/w34kgmiolt1ko92?width=1200&theme=blue" title="Bulgarian First League резултати на живо" width="100%" height="620" loading="eager" scrolling="auto" frameborder="0" allow="fullscreen"></iframe></div></section>`;
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
  const fmt = ds => new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "short" }).format(new Date(`${ds}T12:00`));
  return dates[0] === dates[dates.length - 1] ? fmt(dates[0]) : `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

function defaultRound(events, rounds) {
  const upcoming = events.filter(e => !played(e) && num(e.intRound) > 0)
    .sort((a, b) => `${a.dateEvent}`.localeCompare(`${b.dateEvent}`));
  if (upcoming.length) return num(upcoming[0].intRound);
  const playedRounds = events.filter(played).map(e => num(e.intRound)).filter(Boolean);
  return playedRounds.length ? Math.max(...playedRounds) : rounds[0];
}

// Един ред за мач (като на efbet): дата · домакин · резултат/час · гост.
function roundRow(e) {
  const isPlayed = played(e);
  const mid = isPlayed
    ? `<strong class="rr-score">${escapeHtml(e.intHomeScore)}<span>:</span>${escapeHtml(e.intAwayScore)}</strong>`
    : `<strong class="rr-time">${formatTime(e)}</strong>`;
  const open = isPlayed && state.openMatches.has(e.idEvent);
  const row = `<div class="round-row${isPlayed ? " rr-clickable" : ""}${open ? " open" : ""}"${isPlayed ? ` data-detail="${escapeHtml(e.idEvent)}"` : ""}>
    <span class="rr-date">${escapeHtml(formatDayShort(e))}</span>
    <div class="rr-team rr-home"><b>${escapeHtml(e.strHomeTeam)}</b>${teamLogo(e.strHomeTeam, e.strHomeTeamBadge)}</div>
    ${mid}
    <div class="rr-team rr-away">${teamLogo(e.strAwayTeam, e.strAwayTeamBadge)}<b>${escapeHtml(e.strAwayTeam)}</b></div>
  </div>`;
  const detail = open ? `<div class="match-detail rr-detail">${matchDetailHtml(e)}</div>` : "";
  return `<div class="rr-wrap">${row}${detail}</div>`;
}

function matches() {
  const events = state.data.events || [];
  const rounds = [...new Set(events.map(e => num(e.intRound)).filter(n => n > 0))].sort((a, b) => a - b);
  if (!rounds.length) {
    return `<section class="page-intro"><span class="eyebrow">ПРОГРАМА И РЕЗУЛТАТИ</span><h1>Мачове</h1></section>
    <div class="match-grid page-grid">${events.length ? events.map(matchCard).join("") : empty("Няма мачове.")}</div>`;
  }
  const totalRounds = rounds[rounds.length - 1];
  if (state.round == null || !rounds.includes(state.round)) state.round = defaultRound(events, rounds);
  const cur = state.round;
  const roundEvents = events.filter(e => num(e.intRound) === cur)
    .sort((a, b) => `${a.dateEvent}${a.strTime || ""}`.localeCompare(`${b.dateEvent}${b.strTime || ""}`));
  const idx = rounds.indexOf(cur);
  const prev = idx > 0 ? rounds[idx - 1] : null;
  const next = idx < rounds.length - 1 ? rounds[idx + 1] : null;
  const range = roundDateRange(roundEvents);
  return `<section class="page-intro"><span class="eyebrow">ПРОГРАМА И РЕЗУЛТАТИ</span><h1>Мачове</h1><p>Разгледай мачовете по кръгове. Кликни изигран мач за голове и картони.</p></section>
  <div class="round-nav">
    <button class="round-arrow"${prev == null ? " disabled" : ` data-round="${prev}"`}>‹</button>
    <div class="round-head"><b>Кръг ${cur} от ${totalRounds}</b>${range ? `<small>${range}</small>` : ""}</div>
    <button class="round-arrow"${next == null ? " disabled" : ` data-round="${next}"`}>›</button>
  </div>
  <div class="round-list">${roundEvents.length ? roundEvents.map(roundRow).join("") : empty("Няма мачове за този кръг.")}</div>`;
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

function euroRoundClient(ev) {
  const text = `${ev.strLeague || ""} ${ev.strSeason || ""}`.toLowerCase();
  const n = Number(ev.intRound);
  if (/qualif|preliminary/.test(text)) return n ? `${n}. квалификационен кръг` : "Квалификации";
  if (/play.?off/.test(text)) return "Плейоф";
  if (/group|league phase/.test(text)) return "Основна фаза";
  return n ? `Кръг ${n}` : "";
}

function europeCard(e) {
  const kickoff = new Date(`${e.dateEvent}T${e.strTime || "23:59:59"}`).getTime(), now = Date.now();
  const finished = e.homeScore !== undefined && e.awayScore !== undefined && e.homeScore !== "" && e.awayScore !== "";
  const startExact = new Date(`${e.dateEvent}T${e.strTime || "00:00:00"}`).getTime();
  const live = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(e.status) || (!finished && Boolean(e.strTime) && now >= startExact && now <= startExact + 2.5*60*60*1000);
  const future = kickoff >= now;
  const middle = finished ? `<strong class="score">${escapeHtml(e.homeScore)}<span>:</span>${escapeHtml(e.awayScore)}</strong>`
    : live ? `<strong class="live-pill">НА ЖИВО${e.elapsed ? ` ${escapeHtml(e.elapsed)}′` : ""}</strong>`
    : future ? `<strong class="kickoff">${e.strTime ? formatTime({strTime:e.strTime}) : "Предстои"}</strong>`
    : `<strong class="kickoff euro-na">—</strong>`;
  const meta = euroCompetitionMeta(e);
  return `<article class="europe-card"><div class="euro-meta"><span class="competition ${meta.cls}">${escapeHtml(meta.name)}</span><span>${escapeHtml(e.round || "")}</span></div><time>${formatDate(e)}</time><div class="euro-teams"><div>${euroTeamWithLogo(e.home, e.homeLogo)}</div>${middle}<div>${euroTeamWithLogo(e.away, e.awayLogo)}</div></div></article>`;
}

function europeGroupsHtml() {
  if (!state.europe.length && !state.europeLoaded) return `<div class="empty"><span>⚽</span><b>Зареждаме евротурнирите…</b><small>Издърпваме мачовете на българските отбори автоматично.</small></div>`;
  const html = EUROPE_LEAGUES.map(g => {
    const list = state.europe.filter(e => euroCompetitionMeta(e).cls === g.cls)
      .sort((a,b) => `${a.dateEvent}${a.strTime||""}`.localeCompare(`${b.dateEvent}${b.strTime||""}`));
    if (!list.length) return "";
    return `<section class="euro-section">${sectionTitle("Автоматично", g.name)}<div class="europe-grid">${list.map(europeCard).join("")}</div></section>`;
  }).join("");
  return html || `<div class="empty"><span>⚽</span><b>Няма намерени европейски мачове.</b><small>Българските отбори нямат предстоящи или скорошни мачове в Европа.</small></div>`;
}

function europeParticipantsHtml() {
  return `<section class="euro-section">${sectionTitle("Български отбори", "Участници в Европа")}
    <div class="euro-participants">${EUROPE_PARTICIPANTS.map(item => {
      const club = fallbackTeams.find(t => t.strTeam === item.team);
      return `<article class="participant-card">${teamLogo(item.team, club?.strBadge)}<div><span class="competition ${item.cls}">${item.competition}</span><b>${escapeHtml(item.team)}</b><small>${escapeHtml(item.round)}</small><p>${escapeHtml(item.note)}</p></div></article>`;
    }).join("")}</div></section>`;
}

function apiSportsGamesWidgetHtml() {
  return `<section class="api-widget-section">${sectionTitle("API-SPORTS", "Мачове")}
    <div class="api-widget-wrap">
      <api-sports-widget data-type="games" data-country="Bulgaria" data-refresh="30" data-show-toolbar="true" data-games-style="2" data-target-game="modal"></api-sports-widget>
    </div>
  </section>`;
}

function europe() {
  return `<section class="page-intro europe-intro"><span class="eyebrow">БЪЛГАРИЯ В ЕВРОПА</span><h1>Евротурнири</h1><p>Мачове и резултати на българските отбори в Шампионска лига, Лига Европа и Лига на конференциите.</p><div class="live-status"><i></i> Резултатите се обновяват автоматично${state.europeUpdated?` · ${new Date(state.europeUpdated).toLocaleTimeString("bg-BG",{hour:"2-digit",minute:"2-digit"})}`:""}</div></section>
  ${europeParticipantsHtml()}
  ${apiSportsGamesWidgetHtml()}
  <section class="euro-shortcuts">
    <a href="https://www.uefa.com/uefachampionsleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition ucl">UCL</span><b>Шампионска лига</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaeuropaleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uel">UEL</span><b>Лига Европа</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaconferenceleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uecl">UECL</span><b>Лига на конференциите</b><small>Програма и резултати ↗</small></a>
  </section>
  <div id="europe-results">${europeGroupsHtml()}</div>`;
}

// API-Football v3: европейските турнири са отделни лиги и така избягваме смесването от стария източник.
const API_FOOTBALL_EURO_LEAGUES = {
  2: { name:"Шампионска лига", cls:"ucl" },
  3: { name:"Лига Европа", cls:"uel" },
  848: { name:"Лига на конференциите", cls:"uecl" }
};
const EUROPE_TEAM_SEARCHES = ["Ludogorets", "Levski Sofia", "CSKA Sofia", "CSKA 1948", "Arda Kardzhali", "Cherno More Varna", "Botev Plovdiv"];
const apiFootballHeaders = { Accept: "application/json" };

async function apiFootballJson(path, params = {}) {
  const url = new URL(`${API_FOOTBALL_BASE}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url, { headers: apiFootballHeaders, cache: "no-store" });
  if (!response.ok) throw new Error(`API-Football ${response.status}`);
  const data = await response.json();
  const errors = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (errors?.length) throw new Error(`API-Football: ${errors.join(", ")}`);
  return data.response || [];
}

function apiDateParts(value) {
  const d = new Date(value);
  const pad = n => String(n).padStart(2, "0");
  return { date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, time:`${pad(d.getHours())}:${pad(d.getMinutes())}:00` };
}

function apiFootballRound(text = "") {
  return String(text).replace(/^.*?-\s*/, "").replace(/_/g, " ").trim() || "Европейски турнир";
}

function apiFootballFixtureToEuro(item) {
  const comp = API_FOOTBALL_EURO_LEAGUES[item.league?.id];
  if (!comp || !item.fixture || !item.teams) return null;
  const when = apiDateParts(item.fixture.date);
  const status = item.fixture.status?.short || "";
  const finished = ["FT", "AET", "PEN"].includes(status);
  const live = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(status);
  return {
    id: `api-${item.fixture.id}`,
    competition: comp.name,
    cls: comp.cls,
    round: apiFootballRound(item.league.round || ""),
    dateEvent: when.date,
    strTime: when.time,
    home: item.teams.home?.name || "",
    away: item.teams.away?.name || "",
    homeLogo: item.teams.home?.logo || "",
    awayLogo: item.teams.away?.logo || "",
    homeScore: (finished || live) ? item.goals?.home : undefined,
    awayScore: (finished || live) ? item.goals?.away : undefined,
    status,
    elapsed: item.fixture.status?.elapsed || null
  };
}

async function fetchApiFootballTeamIds() {
  const lists = await Promise.all(EUROPE_TEAM_SEARCHES.map(async search => {
    try { return await apiFootballJson("teams", { search }); } catch { return []; }
  }));
  const ids = new Set();
  for (const list of lists) for (const item of list) {
    if (item.team?.id && item.team?.country === "Bulgaria") ids.add(item.team.id);
  }
  return [...ids];
}

async function fetchLiveEurope() {
  return apiFootballJson("europe");
}

async function fetchAllSportsEurope() {
  const data = await getLocalJson("/allsports/europe");
  return (data.response || []).map(item => {
    const compName = item.league || "";
    const meta = euroCompetition(compName) || EUROPE_LEAGUES.find(g => g.name === item.league) || { name:compName || "Европа", cls:"uecl" };
    const [homeScore, awayScore] = String(item.score || "").split(/\s*-\s*|\s*:\s*/);
    return {
      id: `allsports-${item.id}`,
      competition: meta.name,
      cls: meta.cls,
      round: item.round || "",
      dateEvent: item.dateEvent,
      strTime: item.strTime ? `${item.strTime}:00`.slice(0,8) : "",
      home: item.home,
      away: item.away,
      homeLogo: item.homeLogo,
      awayLogo: item.awayLogo,
      homeScore: homeScore !== undefined && homeScore !== "" ? homeScore : undefined,
      awayScore: awayScore !== undefined && awayScore !== "" ? awayScore : undefined,
      status: item.live ? "LIVE" : item.status
    };
  });
}

function renderEuropeResults() {
  const box = document.querySelector("#europe-results");
  if (box) box.innerHTML = europeGroupsHtml();
  const status = document.querySelector(".europe-intro .live-status");
  if (status) status.innerHTML = `<i></i> Данните идват от API-Football${state.europeUpdated ? ` · ${new Date(state.europeUpdated).toLocaleTimeString("bg-BG",{hour:"2-digit",minute:"2-digit"})}` : ""}`;
}

// Кой е българският отбор в двойката (за сливане на живо + файл без дубли).
function ourTeamOf(fx) {
  const h = localName(fx.home || ""), a = localName(fx.away || "");
  if (fallbackTeams.some(t => t.strTeam === h)) return h;
  if (fallbackTeams.some(t => t.strTeam === a)) return a;
  return "";
}
function euroHasScore(fx) { return fx.homeScore !== undefined && fx.awayScore !== undefined && fx.homeScore !== "" && fx.awayScore !== ""; }
function euroKey(fx) { return `${fx.dateEvent || ""}|${ourTeamOf(fx) || fx.home || fx.id}`; }
function mergeEuroFixtures(...lists) {
  const map = new Map();
  for (const list of lists) for (const fx of list || []) {
    const k = euroKey(fx), cur = map.get(k);
    if (!cur) { map.set(k, { ...fx }); continue; }
    const merged = { ...cur, ...fx };
    // Никога не заменяме съществуващ резултат с празен.
    if (euroHasScore(cur) && !euroHasScore(fx)) { merged.homeScore = cur.homeScore; merged.awayScore = cur.awayScore; }
    map.set(k, merged);
  }
  return [...map.values()];
}

async function refreshEurope(force = false) {
  const now = Date.now();
  if (!force && state.europe.length && state.europeUpdated && now - new Date(state.europeUpdated).getTime() < 5*60_000) {
    renderEuropeResults(); return;
  }
  // Моментално показваме запазените данни, докато дърпаме свежи.
  if (!state.europe.length) {
    try { const s = JSON.parse(localStorage.getItem(EUROPE_CACHE_KEY) || "null"); if (s?.fixtures?.length) { state.europe = s.fixtures; state.europeLoaded = true; renderEuropeResults(); } } catch {}
  }
  // Генерирания файл (от Action) + на живо (браузър) → сливаме, за да имаме
  // и пълния списък, и пресните резултати. Резултат никога не се губи.
  let liveList = [];
  try { liveList = await fetchLiveEurope(); } catch {}
  let allSportsList = [];
  try { allSportsList = await fetchAllSportsEurope(); } catch {}
  const merged = mergeEuroFixtures(liveList, allSportsList);
  state.europeLoaded = true;
  if (merged.length) {
    state.europe = merged;
    state.europeUpdated = new Date().toISOString();
    localStorage.setItem(EUROPE_CACHE_KEY, JSON.stringify({ updatedAt: state.europeUpdated, fixtures: merged }));
  }
  renderEuropeResults();
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
  const games=state.data.events.filter(e=>e.strHomeTeam===team.strTeam || e.strAwayTeam===team.strTeam).slice(-6).reverse();
  const description=clubDescriptions[team.strTeam] || `${team.strTeam} е част от българския футболен елит през сезон 2026/27. Клубът представя своя град в най-високото ниво на българския футбол.`;
  const stats=[[row.intRank||"—","МЯСТО"],[row.intPoints||0,"ТОЧКИ"],[row.intPlayed||0,"МАЧОВЕ"],[row.intWin||0,"ПОБЕДИ"],[row.intDraw||0,"РАВНИ"],[row.intLoss||0,"ЗАГУБИ"]];
  return `<button class="back-btn" data-page="teams">← Всички отбори</button><section class="team-profile">
    <header class="profile-head">${teamLogo(team.strTeam,team.strBadge)}<div><h1>${escapeHtml(team.strTeam)}</h1><p>${escapeHtml(team.strStadium||"България")}</p></div></header>
    <h2>Статистика от сезона</h2><div class="profile-stats">${stats.map(s=>`<div><strong>${s[0]}</strong><small>${s[1]}</small></div>`).join("")}</div>
    <h2>За отбора</h2><p class="team-description">${escapeHtml(description)}</p>
    <h2>Мачове</h2><div class="match-grid">${games.length?games.map(matchCard).join(""):empty("Все още няма публикувани мачове за този отбор.")}</div>
  </section>`;
}

// Livescore забранява вграждане в чужд сайт, затова показваме пълна
// таблица от нашите данни + бутон към официалния Livescore.
const LIVESCORE_URL = "https://www.livescore.com/en/football/bulgaria/parva-liga/standings/";
function fullStandings(rows) {
  if (!rows.length) return empty("Класирането още не е налично.");
  return `<div class="table-wrap"><table class="full-table"><thead><tr><th>#</th><th>Отбор</th>
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
  return `<section class="page-intro"><span class="eyebrow">LIVESCORE</span><h1>Класиране</h1><p>Пълната таблица на Първа лига, изчислена от изиграните мачове. За официалния източник виж Livescore.</p>
  <a class="ls-open" href="${LIVESCORE_URL}" target="_blank" rel="noopener noreferrer">Виж в Livescore ↗</a></section>
  ${fullStandings(state.data?.table || [])}
  <p class="data-note">Livescore не разрешава директно вграждане в чужд сайт, затова показваме собствената таблица. Бутонът „Виж в Livescore ↗" отваря официалната страница.</p>`;
}

function archive() {
  const seasons = ["2026-2027","2025-2026","2024-2025","2023-2024"];
  return `<section class="page-intro"><span class="eyebrow">ИСТОРИЯ</span><h1>Архив</h1><p>Класиране и мачове от предходни сезони.</p></section>
  <div class="archive-grid">${seasons.map((s,i)=>`<button class="archive-card ${state.season===s?"active":""}" data-season="${s}"><small>СЕЗОН</small><b>${s.replace("-"," / ")}</b><span>${i===0?"Текущ":"Отвори архива"} →</span></button>`).join("")}</div>
  <div id="archive-content">${state.season===SEASON ? standings(state.data.table) : empty(`Данните за ${state.season} се зареждат от data/${state.season}.json`)}</div>`;
}

function content() {
  if (state.loading && !state.data) return `<div class="loader"><span></span><b>Зареждаме първенството…</b></div>`;
  if (state.page === "standings") return livescore();
  if (state.page === "matches") return matches();
  if (state.page === "teams") return teams();
  if (state.page === "team-detail") return teamProfile();
  if (state.page === "europe") return europe();
  if (state.page === "archive") return archive();
  return home();
}

function render() {
  $("#app").innerHTML = content();
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { state.page=el.dataset.page; scrollTo(0,0); render(); if(state.page==="europe") refreshEurope(); }));
  document.querySelectorAll("[data-team]").forEach(el => el.addEventListener("click", () => { state.selectedTeam=el.dataset.team; state.page="team-detail"; scrollTo(0,0); render(); }));
  document.querySelectorAll("[data-detail]").forEach(el => el.addEventListener("click", async () => {
    const id = el.dataset.detail;
    if (state.openMatches.has(id)) { state.openMatches.delete(id); render(); return; }
    state.openMatches.add(id);
    const ev = state.data.events.find(x => x.idEvent === id);
    if (ev && !ev.goals && !ev.cards && !ev._detailLoaded) {
      state.loadingDetail = id; render();
      await loadMatchDetail(id);
      state.loadingDetail = null;
    }
    render();
  }));
  document.querySelectorAll("[data-filter]").forEach(el => el.addEventListener("click", () => { state.filter=el.dataset.filter; render(); }));
  document.querySelectorAll("[data-round]").forEach(el => el.addEventListener("click", () => { state.round=num(el.dataset.round); scrollTo(0,0); render(); }));
  $("#team-filter")?.addEventListener("change", e => { state.team=e.target.value; render(); });
  $("#refresh-live")?.addEventListener("click", () => refreshAllSportsLive(true));
  document.querySelectorAll("[data-season]").forEach(el => el.addEventListener("click", async () => {
    state.season=el.dataset.season;
    if (state.season !== SEASON) {
      try { const r=await fetch(`data/${state.season}.json`); const d=await r.json(); state.data.table=d.table||state.data.table; } catch {}
    }
    render();
  }));
  document.querySelectorAll(".nav-item[data-page]").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));
  const status = $("#data-status");
  if (status && state.data) status.innerHTML = `<i class="${state.data.live ? "" : "offline"}"></i>${state.data.live ? "Данните са актуални" : "Показваме запазени данни"}`;
  if (state.page === "home") refreshAllSportsLive();
}

function checkMatchNotifications() {
  if (Notification.permission !== "granted" || !state.data?.events) return;
  const sent = new Set(JSON.parse(localStorage.getItem("a-grupa-notified") || "[]"));
  const now = Date.now();
  state.data.events.filter(e => !played(e)).forEach(e => {
    const start = new Date(`${e.dateEvent}T${e.strTime || "00:00"}`).getTime();
    if (start >= now - 5 * 60_000 && start <= now + 60_000 && !sent.has(e.idEvent)) {
      sendMatchNotification(`${e.strHomeTeam} – ${e.strAwayTeam}`, { body:"Мачът започва сега.", tag:`match-start-${e.idEvent}` });
      sent.add(e.idEvent);
    }
  });
  localStorage.setItem("a-grupa-notified", JSON.stringify([...sent]));
}

async function sendMatchNotification(title, options={}) {
  const config={...options,icon:"assets/logos/desktop-192.png",badge:"assets/logos/favicon-32.png",data:{url:"./"}};
  if ("serviceWorker" in navigator) {
    const registration=await navigator.serviceWorker.ready;
    return registration.showNotification(title,config);
  }
  return new Notification(title,config);
}

document.querySelectorAll(".nav-item[data-page]").forEach(el => el.addEventListener("click", () => { state.page=el.dataset.page; scrollTo(0,0); render(); }));
$("#refresh").addEventListener("click", () => loadData(true));
$("#notify")?.addEventListener("click", async () => {
  if (!("Notification" in window)) return alert("Този браузър не поддържа известия.");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await sendMatchNotification("А Група", { body:"Известията за начало на мач са включени.",tag:"notifications-enabled" });
    $("#notify").classList.add("enabled");
    $("#notify").title="Известията са включени";
  }
});
loadData();
if ("Notification" in window && Notification.permission === "granted") {
  $("#notify")?.classList.add("enabled");
  $("#notify").title="Известията са включени";
}
setInterval(checkMatchNotifications, 60_000);
setInterval(()=>{if(state.page==="europe") refreshEurope();},60_000);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("service-worker.js");
