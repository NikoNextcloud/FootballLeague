import { mkdir, writeFile, readFile } from "node:fs/promises";

const API = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_ID = "4626";
const season = process.argv[2] || "2026-2027";
// По подразбиране дърпаме таймлайн (голмайстори + картони) и евротурнирите.
// Може да се изключи с DETAILS=0 / EUROPE=0.
const withDetails = process.env.DETAILS !== "0" && process.env.FULL_SCORERS !== "0";
const withEurope = process.env.EUROPE !== "0";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function get(path) {
  const response = await fetch(`${API}/${path}`);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

// Безопасна заявка – при грешка връща null вместо да спре целия скрипт.
async function tryGet(path) {
  try { return await get(path); }
  catch (error) { console.warn(`skip ${path}: ${error.message}`); return null; }
}

const played = e => e && e.intHomeScore !== null && e.intHomeScore !== "" && e.intHomeScore !== undefined;

// ---- Разбор на таймлайн: голове и картони за един мач ----
function parseTimeline(timeline = [], event = {}) {
  const goals = [];
  const cards = [];
  const homeName = (event.strHomeTeam || "").toLowerCase();
  for (const item of timeline) {
    const type = `${item.strTimeline || item.strTimelineType || item.strEvent || ""}`.toLowerCase();
    const detail = `${item.strTimelineDetail || ""}`.toLowerCase();
    const player = item.strPlayer || item.strPlayerName || "";
    const minute = `${item.intTime ?? ""}`.replace(/[^0-9+]/g, "");
    // Коя страна – по strHome ("Yes"/"No") или по името на отбора.
    let side = item.strHome === "Yes" ? "H" : item.strHome === "No" ? "A" : null;
    if (!side && item.strTeam) side = item.strTeam.toLowerCase() === homeName ? "H" : "A";
    if (!side) side = "H";

    if (type.includes("card")) {
      const red = type.includes("red");
      cards.push({ side, player, minute, red });
      continue;
    }
    const missed = type.includes("miss") || detail.includes("miss") || type.includes("saved");
    const isGoal = (type.includes("goal") || type.includes("penalty")) && !missed;
    if (!isGoal) continue;
    const own = type.includes("own");
    const penalty = type.includes("penalty") || detail.includes("penalty");
    // Автогол се брои за противника.
    const goalSide = own ? (side === "H" ? "A" : "H") : side;
    goals.push({ side: goalSide, player, minute, penalty, own });
  }
  return { goals, cards };
}

// ---- Основни данни на първенството ----
const [tableResult, eventResult, teamResult, nextResult] = await Promise.all([
  tryGet(`lookuptable.php?l=${LEAGUE_ID}&s=${season}`),
  tryGet(`eventsseason.php?id=${LEAGUE_ID}&s=${season}`),
  tryGet(`lookup_all_teams.php?id=${LEAGUE_ID}`),
  tryGet(`eventsnextleague.php?id=${LEAGUE_ID}`)
]);

const events = eventResult?.events || [];
const next = nextResult?.events || [];
const known = new Set(events.map(event => event.idEvent));
next.forEach(event => { if (!known.has(event.idEvent)) events.push(event); });

// ---- Голмайстори + подробности за всеки завършен мач ----
const scorers = new Map();
if (withDetails) {
  const finished = events.filter(played);
  console.log(`Fetching timelines for ${finished.length} finished matches…`);
  for (const event of finished) {
    const result = await tryGet(`lookuptimeline.php?id=${event.idEvent}`);
    const { goals, cards } = parseTimeline(result?.timeline || [], event);
    if (goals.length) event.goals = goals;
    if (cards.length) event.cards = cards;
    for (const goal of goals) {
      if (goal.own || !goal.player) continue;
      const team = goal.side === "H" ? event.strHomeTeam : event.strAwayTeam;
      const current = scorers.get(goal.player) || { player: goal.player, team, goals: 0, penalties: 0 };
      current.goals += 1;
      if (goal.penalty) current.penalties += 1;
      scorers.set(goal.player, current);
    }
    await sleep(2100);
  }
}

// ---- Евротурнири: издърпваме от предстоящите/последните мачове на всеки отбор ----
const EURO_COMPETITIONS = [
  { test: /champions/i, name: "Шампионска лига", cls: "ucl" },
  { test: /conference/i, name: "Лига на конференциите", cls: "uecl" },
  { test: /europa/i, name: "Лига Европа", cls: "uel" }
];
const EURO_LEAGUE_IDS = { "4480": EURO_COMPETITIONS[0], "4481": EURO_COMPETITIONS[2], "4482": EURO_COMPETITIONS[1] };
function euroCompetition(strLeague = "", idLeague = "") {
  return EURO_COMPETITIONS.find(c => c.test.test(strLeague)) || EURO_LEAGUE_IDS[idLeague] || null;
}
function euroRound(event = {}) {
  const text = `${event.strLeague || ""} ${event.strSeason || ""}`.toLowerCase();
  const n = Number(event.intRound);
  if (/qualif|preliminary/.test(text)) return n ? `${n}. квалификационен кръг` : "Квалификации";
  if (/play.?off/.test(text)) return "Плейоф";
  if (/group|league phase/.test(text)) return "Основна фаза";
  return n ? `Кръг ${n}` : "";
}

const europeFixtures = [];
if (withEurope) {
  const teams = teamResult?.teams || [];
  const ourIds = new Set(teams.map(t => t.idTeam).filter(Boolean));
  const ourNames = new Set(teams.map(t => (t.strTeam || "").toLowerCase()).filter(Boolean));
  const isOurs = ev => ourIds.has(ev.idHomeTeam) || ourIds.has(ev.idAwayTeam)
    || ourNames.has((ev.strHomeTeam || "").toLowerCase()) || ourNames.has((ev.strAwayTeam || "").toLowerCase());
  const seen = new Set();
  const addEuroEvent = event => {
    if (event.idLeague === LEAGUE_ID || seen.has(event.idEvent)) return;
    const comp = euroCompetition(event.strLeague, event.idLeague);
    if (!comp) return;
    seen.add(event.idEvent);
    const fixture = {
      id: `ev-${event.idEvent}`, idEvent: event.idEvent,
      competition: comp.name, cls: comp.cls, round: euroRound(event),
      dateEvent: event.dateEvent, strTime: (event.strTime || "").slice(0, 8),
      home: event.strHomeTeam, away: event.strAwayTeam
    };
    if (played(event)) { fixture.homeScore = event.intHomeScore; fixture.awayScore = event.intAwayScore; }
    europeFixtures.push(fixture);
  };

  // Метод 1: мачовете на всеки наш отбор (хваща квалификации без значение под коя лига стоят).
  console.log(`Scanning ${teams.length} teams for European fixtures…`);
  for (const team of teams) {
    if (!team.idTeam) continue;
    const [nextEv, lastEv] = await Promise.all([
      tryGet(`eventsnext.php?id=${team.idTeam}`),
      tryGet(`eventslast.php?id=${team.idTeam}`)
    ]);
    [...(nextEv?.events || []), ...(lastEv?.results || lastEv?.events || [])].forEach(addEuroEvent);
    await sleep(1600);
  }

  // Метод 2: целите евротурнири за сезона, филтрирани до нашите отбори (резервен, безплатен).
  for (const lid of Object.keys(EURO_LEAGUE_IDS)) {
    const res = await tryGet(`eventsseason.php?id=${lid}&s=${season}`);
    (res?.events || []).filter(isOurs).forEach(addEuroEvent);
    await sleep(1600);
  }

  europeFixtures.sort((a, b) => `${a.dateEvent}${a.strTime}`.localeCompare(`${b.dateEvent}${b.strTime}`));
  await mkdir(new URL("./data/", import.meta.url), { recursive: true });
  await writeFile(new URL("./data/europe.json", import.meta.url), JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: "TheSportsDB (eventsnext/eventslast per team)",
    fixtures: europeFixtures
  }, null, 2));
  console.log(`Saved data/europe.json: ${europeFixtures.length} European fixtures.`);
}

// ---- Сливане със стария файл: старите (изиграни) мачове никога не се губят ----
const seasonUrl = new URL(`./data/${season}.json`, import.meta.url);
let previous = null;
try { previous = JSON.parse(await readFile(seasonUrl, "utf8")); } catch {}
let mergedEvents = events;
if (previous?.events?.length) {
  const byId = new Map(previous.events.map(e => [e.idEvent, e]));
  for (const event of events) {
    const old = byId.get(event.idEvent);
    // Запазваме вече изчислените голове/картони, ако този път не са дошли.
    if (old?.goals && !event.goals) event.goals = old.goals;
    if (old?.cards && !event.cards) event.cards = old.cards;
    byId.set(event.idEvent, event);
  }
  mergedEvents = [...byId.values()].sort((a, b) =>
    `${a.dateEvent || ""}${a.strTime || ""}`.localeCompare(`${b.dateEvent || ""}${b.strTime || ""}`));
}

// ---- Запис на сезонния файл ----
const payload = {
  leagueId: LEAGUE_ID, season, updatedAt: new Date().toISOString(),
  table: tableResult?.table || previous?.table || [], events: mergedEvents,
  teams: teamResult?.teams || previous?.teams || [],
  scorers: scorers.size ? [...scorers.values()].sort((a, b) => b.goals - a.goals) : (previous?.scorers || [])
};
await mkdir(new URL("./data/", import.meta.url), { recursive: true });
await writeFile(seasonUrl, JSON.stringify(payload, null, 2));
console.log(`Saved ${season}: ${payload.table.length} teams, ${mergedEvents.length} matches, ${payload.scorers.length} scorers.`);
