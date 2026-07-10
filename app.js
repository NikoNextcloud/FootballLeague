const API = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_ID = "4626";
const SEASON = "2026-2027";
const CACHE_KEY = "a-grupa-data-v7";
const EUROPE_CACHE_KEY = "a-grupa-europe-v1";

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

const europeFixtures=[
  {id:"ucl-1",competition:"Шампионска лига",round:"I квалификационен кръг",dateEvent:"2026-07-07",strTime:"",home:"Борац Баня Лука",away:"Левски",homeScore:"1",awayScore:"1",search:["Borac Banja Luka vs Levski Sofia","Borac Banja Luka vs Levski","FK Borac Banja Luka vs PFC Levski Sofia"]},
  {id:"ucl-2",competition:"Шампионска лига",round:"I квалификационен кръг · реванш",dateEvent:"2026-07-14",strTime:"",home:"Левски",away:"Борац Баня Лука",search:["Levski Sofia vs Borac Banja Luka","Levski vs Borac Banja Luka","PFC Levski Sofia vs FK Borac Banja Luka"]},
  {id:"uel-1",competition:"Лига Европа",round:"I квалификационен кръг",dateEvent:"2026-07-09",strTime:"",home:"ЦСКА",away:"Дери Сити",homeScore:"3",awayScore:"2",search:["CSKA Sofia vs Derry City","PFC CSKA Sofia vs Derry City","CSKA vs Derry City"]},
  {id:"uel-2",competition:"Лига Европа",round:"I квалификационен кръг · реванш",dateEvent:"2026-07-16",strTime:"",home:"Дери Сити",away:"ЦСКА",search:["Derry City vs CSKA Sofia","Derry City vs PFC CSKA Sofia","Derry City vs CSKA"]},
  {id:"uecl-1",competition:"Лига на конференциите",round:"II квалификационен кръг",dateEvent:"2026-07-23",strTime:"",home:"Апоел Тел Авив",away:"Лудогорец",search:["Hapoel Tel Aviv vs Ludogorets","Hapoel Tel Aviv vs Ludogorets Razgrad"]},
  {id:"uecl-2",competition:"Лига на конференциите",round:"II квалификационен кръг · реванш",dateEvent:"2026-07-30",strTime:"",home:"Лудогорец",away:"Апоел Тел Авив",search:["Ludogorets vs Hapoel Tel Aviv","Ludogorets Razgrad vs Hapoel Tel Aviv"]},
  {id:"uecl-3",competition:"Лига на конференциите",round:"II квалификационен кръг",dateEvent:"2026-07-23",strTime:"",home:"Спартак Търнава",away:"ЦСКА 1948",search:["Spartak Trnava vs CSKA 1948","FC Spartak Trnava vs CSKA 1948"]},
  {id:"uecl-4",competition:"Лига на конференциите",round:"II квалификационен кръг · реванш",dateEvent:"2026-07-30",strTime:"",home:"ЦСКА 1948",away:"Спартак Търнава",search:["CSKA 1948 vs Spartak Trnava","CSKA 1948 Sofia vs FC Spartak Trnava"]}
];

const state = { page: "home", filter: "all", team: "all", season: SEASON, selectedTeam: null, europeUpdated:null, europeFixtures:[...europeFixtures], data: null, loading: true };
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
  if (table.length < teams.length) {
    const official = new Map(table.map(r => [r.strTeam,r]));
    table = calculateStandings(events, teams).map(r => official.has(r.strTeam) ? {...r,...official.get(r.strTeam)} : r)
      .sort((a,b)=>num(b.intPoints)-num(a.intPoints) || num(b.intGoalDifference)-num(a.intGoalDifference))
      .map((r,i)=>({...r,intRank:i+1}));
  }
  return { table, events, teams, updatedAt: new Date().toISOString(), live: true };
}

async function loadData(force = false) {
  state.loading = true; render();
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  if (!force && cached && Date.now() - new Date(cached.updatedAt).getTime() < 15 * 60_000) {
    state.data = cached; state.loading = false; render(); return;
  }
  try {
    const [table, events, nextEvents, teams] = await Promise.all([
      getJson(`lookuptable.php?l=${LEAGUE_ID}&s=${SEASON}`),
      getJson(`eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`),
      getJson(`eventsnextleague.php?id=${LEAGUE_ID}`),
      getJson(`lookup_all_teams.php?id=${LEAGUE_ID}`)
    ]);
    const knownIds = new Set((events.events || []).map(e => e.idEvent));
    (nextEvents.events || []).forEach(e => { if (!knownIds.has(e.idEvent)) (events.events ||= []).push(e); });
    events.events = (events.events || []).filter(e => !officialUpcoming.some(o => o.strHomeTeam===localName(e.strHomeTeam) && o.strAwayTeam===localName(e.strAwayTeam)));
    events.events.push(...officialUpcoming);
    state.data = normalize(table, events, teams);
    localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
  } catch (error) {
    state.data = cached || { table: [], events: [], teams: fallbackTeams, updatedAt: new Date().toISOString(), live: false };
    state.data.live = false;
  }
  state.loading = false; render();
}

const played = e => e.intHomeScore !== null && e.intHomeScore !== "" && e.intHomeScore !== undefined;
const formatDate = e => new Intl.DateTimeFormat("bg-BG", { weekday:"short", day:"numeric", month:"short" }).format(new Date(`${e.dateEvent}T${e.strTime || "12:00"}`));
const formatTime = e => (e.strTime || "").slice(0,5) || "—";

function teamLogo(name, src) { return `<img class="team-logo" src="${escapeHtml(src || localBadge(name))}" alt="" loading="lazy" onerror="this.src='assets/logos/icon-192.png'">`; }

function matchCard(e) {
  const score = played(e) ? `<strong class="score">${escapeHtml(e.intHomeScore)}<span>:</span>${escapeHtml(e.intAwayScore)}</strong>` : `<strong class="kickoff">${formatTime(e)}</strong>`;
  return `<article class="match-card">
    <div class="match-meta"><span>Кръг ${escapeHtml(e.intRound || "—")}</span><time>${formatDate(e)}</time></div>
    <div class="match-team home"><b>${escapeHtml(e.strHomeTeam)}</b>${teamLogo(e.strHomeTeam,e.strHomeTeamBadge)}</div>
    ${score}
    <div class="match-team away">${teamLogo(e.strAwayTeam,e.strAwayTeamBadge)}<b>${escapeHtml(e.strAwayTeam)}</b></div>
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

function matches() {
  let events = state.data.events;
  if (state.filter === "upcoming") events = events.filter(e => !played(e));
  if (state.filter === "results") events = events.filter(played).reverse();
  if (state.team !== "all") events = events.filter(e => e.idHomeTeam === state.team || e.idAwayTeam === state.team);
  return `<section class="page-intro"><span class="eyebrow">ПРОГРАМА И РЕЗУЛТАТИ</span><h1>Мачове</h1><p>Избери период или любим отбор.</p></section>
  <div class="filters"><div class="chips">${[["all","Всички"],["upcoming","Предстоящи"],["results","Резултати"]].map(([v,l]) => `<button class="chip ${state.filter===v?"active":""}" data-filter="${v}">${l}</button>`).join("")}</div>
  <select id="team-filter"><option value="all">Всички отбори</option>${state.data.teams.map(t => `<option value="${t.idTeam}" ${state.team===t.idTeam?"selected":""}>${escapeHtml(t.strTeam)}</option>`).join("")}</select></div>
  <div class="match-grid page-grid">${events.length ? events.map(matchCard).join("") : empty("Няма мачове за този избор.")}</div>`;
}

function teams() {
  return `<section class="page-intro"><span class="eyebrow">КЛУБОВЕТЕ</span><h1>Отбори</h1><p>${state.data.teams.length} отбора в българския футболен елит.</p></section>
  <div class="teams-grid">${state.data.teams.map(t => `<button class="team-card" data-team="${escapeHtml(t.idTeam)}">${teamLogo(t.strTeam,t.strBadge)}<div><b>${escapeHtml(t.strTeam)}</b><small>${escapeHtml(t.strStadium || "България")}</small><span>Виж профила →</span></div></button>`).join("")}</div>`;
}

function euroTeam(name) {
  const club=fallbackTeams.find(t=>t.strTeam===name);
  return club ? `${teamLogo(name,club.strBadge)}<b>${escapeHtml(name)}</b>` : `<span class="opponent-mark">${escapeHtml(name.split(/\s+/).map(x=>x[0]).slice(0,2).join(""))}</span><b>${escapeHtml(name)}</b>`;
}

function europeFallbackHtml() {
  const groups=["Шампионска лига","Лига Европа","Лига на конференциите"];
  return groups.map(g=>`<section class="euro-section euro-fallback">${sectionTitle("Автоматични резултати",g)}<div class="europe-grid">${state.europeFixtures.filter(e=>e.competition===g).map(europeCard).join("")}</div></section>`).join("");
}

function europeCard(e) {
  const start=new Date(`${e.dateEvent}T${e.strTime}`).getTime(), now=Date.now();
  const live=Boolean(e.strTime) && now>=start && now<=start+2.5*60*60*1000;
  const finished=e.homeScore!==undefined && e.awayScore!==undefined && e.homeScore!=="" && e.awayScore!=="";
  const future=new Date(`${e.dateEvent}T${e.strTime || "23:59:59"}`).getTime()>=now;
  const waitingText=future ? (e.strTime ? formatTime({strTime:e.strTime}) : "Предстои") : "Очаква";
  const middle=finished ? `<strong class="score">${e.homeScore}<span>:</span>${e.awayScore}</strong>` : live ? `<strong class="live-pill">НА ЖИВО</strong>` : `<strong class="kickoff">${waitingText}</strong>`;
  const competitionClass=e.competition.includes("Шампионска")?"ucl":e.competition==="Лига Европа"?"uel":"uecl";
  return `<article class="europe-card"><div class="euro-meta"><span class="competition ${competitionClass}">${e.competition}</span><span>${e.round}</span></div><time>${formatDate(e)}</time><div class="euro-teams"><div>${euroTeam(e.home)}</div>${middle}<div>${euroTeam(e.away)}</div></div>${live&&!finished?`<small class="waiting-live">Изчакваме резултат от безплатния източник…</small>`:""}</article>`;
}

function europe() {
  return `<section class="page-intro europe-intro"><span class="eyebrow">БЪЛГАРИЯ В ЕВРОПА</span><h1>Евротурнири</h1><p>Мачове и резултати на българските отбори в Шампионска лига, Лига Европа и Лига на конференциите.</p><div class="live-status"><i></i> Резултатите се проверяват автоматично${state.europeUpdated?` · ${new Date(state.europeUpdated).toLocaleTimeString("bg-BG",{hour:"2-digit",minute:"2-digit"})}`:""}</div></section>
  <section class="euro-shortcuts">
    <a href="https://www.uefa.com/uefachampionsleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition ucl">UCL</span><b>Шампионска лига</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaeuropaleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uel">UEL</span><b>Лига Европа</b><small>Програма и резултати ↗</small></a>
    <a href="https://www.uefa.com/uefaconferenceleague/fixtures-results/" target="_blank" rel="noopener"><span class="competition uecl">UECL</span><b>Лига на конференциите</b><small>Програма и резултати ↗</small></a>
  </section>
  <div id="europe-results">${europeFallbackHtml()}</div>`;
}

function pickEuropeEvent(events=[], fixture) {
  if (!events.length) return null;
  const target=new Date(`${fixture.dateEvent}T12:00:00`).getTime();
  const withDistance=events.map(event=>({...event,_distance:Math.abs(new Date(`${event.dateEvent}T12:00:00`).getTime()-target)}));
  return withDistance.find(event=>event.dateEvent===fixture.dateEvent && played(event)) ||
    withDistance.find(event=>event.dateEvent===fixture.dateEvent) ||
    withDistance.filter(played).sort((a,b)=>a._distance-b._distance)[0] ||
    withDistance.sort((a,b)=>a._distance-b._distance)[0];
}

async function refreshEurope() {
  const byId=new Map(state.europeFixtures.map(e=>[e.id,e]));
  try {
    const stored=JSON.parse(localStorage.getItem(EUROPE_CACHE_KEY)||"null");
    if(stored?.fixtures) stored.fixtures.forEach(e=>byId.has(e.id)&&Object.assign(byId.get(e.id),e));
  } catch {}
  try {
    const response=await fetch(`data/europe.json?ts=${Date.now()}`,{cache:"no-store"});
    if(response.ok) {
      const local=await response.json();
      (local.fixtures||[]).forEach(e=>byId.has(e.id)&&Object.assign(byId.get(e.id),e));
    }
  } catch {}
  await Promise.all(state.europeFixtures.map(async fixture=>{
    for(const q of fixture.search||[]) {
      try {
        const result=await getJson(`searchevents.php?e=${encodeURIComponent(q)}`);
        const found=pickEuropeEvent(result.event||[],fixture);
        if(!found) continue;
        fixture.dateEvent=found.dateEvent||fixture.dateEvent;
        fixture.strTime=found.strTime||fixture.strTime;
        if(played(found)) {
          fixture.homeScore=found.intHomeScore;
          fixture.awayScore=found.intAwayScore;
        }
        break;
      } catch {}
    }
  }));
  state.europeFixtures=[...byId.values()];
  state.europeUpdated=new Date().toISOString();
  localStorage.setItem(EUROPE_CACHE_KEY,JSON.stringify({updatedAt:state.europeUpdated,fixtures:state.europeFixtures}));
  const box=document.querySelector("#europe-results");
  if(box) box.innerHTML=europeFallbackHtml();
  const status=document.querySelector(".europe-intro .live-status");
  if(status) status.innerHTML=`<i></i> Резултатите са проверени автоматично · ${new Date(state.europeUpdated).toLocaleTimeString("bg-BG",{hour:"2-digit",minute:"2-digit"})}`;
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

const scorersData = [
  ["Ивайло Чочев","Лудогорец",12,2],["Евертон Бала","Левски",12,4],["Сантиаго Годой","ЦСКА",9,2],
  ["Мамаду Диало","ЦСКА 1948",9,3],["Квадво Дуа","Лудогорец",8,1],["Бирсент Карагарен","Арда",7,0],
  ["Георг Стояновски","Спартак Варна",7,0],["Анте Аралица","Локомотив София",7,0],
  ["Франклин Маскоте","Ботев Пловдив",7,0],["Петър Станич","Лудогорец",7,1],
  ["Мустафа Сангаре","Левски",7,3],["Бертран Фурие","Септември София",7,3]
];

function scorers() {
  return `<section class="page-intro"><span class="eyebrow">ПОСЛЕДЕН ЗАВЪРШЕН СЕЗОН</span><h1>Голмайстори</h1><p>Голове и отбелязани дузпи през сезон 2025/26.</p></section>
  <div class="scorers-list">${scorersData.map((s,i) => `<article class="scorer-card"><span class="scorer-rank">${i+1}</span>${teamLogo(s[1])}<div><b>${s[0]}</b><small>${s[1]}</small></div><strong>${s[2]}<small> гола</small></strong><span class="penalties">${s[3]} дузпи</span></article>`).join("")}</div>
  <p class="data-note">Статистиката се обновява чрез автоматичния файл <code>fetch-data.mjs</code>. Безплатният TheSportsDB API не предлага готова пълна голмайсторска таблица.</p>`;
}

function archive() {
  const seasons = ["2026-2027","2025-2026","2024-2025","2023-2024"];
  return `<section class="page-intro"><span class="eyebrow">ИСТОРИЯ</span><h1>Архив</h1><p>Класиране и мачове от предходни сезони.</p></section>
  <div class="archive-grid">${seasons.map((s,i)=>`<button class="archive-card ${state.season===s?"active":""}" data-season="${s}"><small>СЕЗОН</small><b>${s.replace("-"," / ")}</b><span>${i===0?"Текущ":"Отвори архива"} →</span></button>`).join("")}</div>
  <div id="archive-content">${state.season===SEASON ? standings(state.data.table) : empty(`Данните за ${state.season} се зареждат от data/${state.season}.json`)}</div>`;
}

function content() {
  if (state.loading && !state.data) return `<div class="loader"><span></span><b>Зареждаме първенството…</b></div>`;
  if (state.page === "standings") return `<section class="page-intro"><span class="eyebrow">СЕЗОН 2026/27</span><h1>Класиране</h1><p>Актуално подреждане, точки и голова разлика.</p></section>${standings(state.data.table)}`;
  if (state.page === "matches") return matches();
  if (state.page === "teams") return teams();
  if (state.page === "team-detail") return teamProfile();
  if (state.page === "europe") return europe();
  if (state.page === "scorers") return scorers();
  if (state.page === "archive") return archive();
  return home();
}

function render() {
  $("#app").innerHTML = content();
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { state.page=el.dataset.page; scrollTo(0,0); render(); if(state.page==="europe") refreshEurope(); }));
  document.querySelectorAll("[data-team]").forEach(el => el.addEventListener("click", () => { state.selectedTeam=el.dataset.team; state.page="team-detail"; scrollTo(0,0); render(); }));
  document.querySelectorAll("[data-filter]").forEach(el => el.addEventListener("click", () => { state.filter=el.dataset.filter; render(); }));
  $("#team-filter")?.addEventListener("change", e => { state.team=e.target.value; render(); });
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
