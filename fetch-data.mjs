import { mkdir, writeFile } from "node:fs/promises";

const API = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_ID = "4626";
const season = process.argv[2] || "2026-2027";
const fullScorers = process.env.FULL_SCORERS === "1";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function get(path) {
  const response = await fetch(`${API}/${path}`);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

const [tableResult, eventResult, teamResult, nextResult] = await Promise.all([
  get(`lookuptable.php?l=${LEAGUE_ID}&s=${season}`),
  get(`eventsseason.php?id=${LEAGUE_ID}&s=${season}`),
  get(`lookup_all_teams.php?id=${LEAGUE_ID}`),
  get(`eventsnextleague.php?id=${LEAGUE_ID}`)
]);

const events = eventResult.events || [];
const next = nextResult.events || [];
const known = new Set(events.map(event => event.idEvent));
next.forEach(event => { if (!known.has(event.idEvent)) events.push(event); });

const scorers = new Map();
if (fullScorers) {
  for (const event of events.filter(event => event.intHomeScore !== null && event.intHomeScore !== "")) {
    const result = await get(`lookuptimeline.php?id=${event.idEvent}`);
    for (const item of result.timeline || []) {
      const type = `${item.strTimeline || item.strEvent || item.strType || ""}`.toLowerCase();
      if (!type.includes("goal")) continue;
      const player = item.strPlayer || item.strPlayerName;
      if (!player) continue;
      const current = scorers.get(player) || { player, team: item.strTeam || "", goals: 0 };
      current.goals += 1;
      scorers.set(player, current);
    }
    await sleep(2100);
  }
}

const payload = { leagueId:LEAGUE_ID, season, updatedAt:new Date().toISOString(), table:tableResult.table || [], events,
  teams:teamResult.teams || [], scorers:[...scorers.values()].sort((a,b) => b.goals - a.goals) };
await mkdir(new URL("./data/", import.meta.url), { recursive:true });
await writeFile(new URL(`./data/${season}.json`, import.meta.url), JSON.stringify(payload, null, 2));
console.log(`Saved ${season}: ${payload.table.length} teams, ${events.length} matches, ${payload.scorers.length} scorers.`);
