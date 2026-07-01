// scripts/fetch-scorers.mjs
//
// Топ голмайстори — изчислени от timeline данните на изиграните мачове.
// TheSportsDB няма отделен безплатен "top scorers" endpoint, затова агрегираме
// head-to-head от lookuptimeline.php за всеки приключил мач.
//
// ВАЖНО ограничение на безплатния план: lookuptimeline.php връща само първите
// няколко събития от мача (не пълния timeline), затова класацията е ориентировъчна,
// а не 100% точна. При Premium ключ (THESPORTSDB_API_KEY secret) лимитът е по-висок
// и резултатът ще е по-пълен.
//
// Скриптът кешира кои мачове вече са обработени (public/data/scorers-cache.json),
// за да не praви излишни заявки повторно, и обработва малка партида нови мачове
// на всяко пускане (за да не претоварва безплатния ключ).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const OUT_DIR = path.resolve("public/data");
const LEAGUE_FILE = path.join(OUT_DIR, "league.json");
const CACHE_FILE = path.join(OUT_DIR, "scorers-cache.json");
const OUT_FILE = path.join(OUT_DIR, "scorers.json");

const MAX_NEW_MATCHES_PER_RUN = 20; // пази безплатния ключ от претоварване
const DELAY_MS = 350;

async function readJSON(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getTimeline(eventId) {
  const res = await fetch(`${BASE}/lookuptimeline.php?id=${eventId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json?.timeline || [];
}

function isGoalEntry(entry) {
  const type = (entry.strTimeline || entry.strTimelineDetail || "").toLowerCase();
  if (!type.includes("goal")) return false;
  if (type.includes("own")) return false; // собствен гол не се брои за играча
  if (type.includes("miss") || type.includes("disallow")) return false;
  return true;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const league = await readJSON(LEAGUE_FILE, null);
  if (!league) {
    console.warn("Няма league.json — първо изпълни fetch-data.mjs.");
    return;
  }

  const finished = [...(league.past || []), ...(league.events || [])].filter(
    (e) => e.intHomeScore !== null && e.intHomeScore !== undefined && e.intHomeScore !== ""
  );
  const uniqueFinished = Array.from(new Map(finished.map((e) => [e.idEvent, e])).values());

  const cache = await readJSON(CACHE_FILE, { processed: {}, goalsByPlayer: {} });
  cache.processed ||= {};
  cache.goalsByPlayer ||= {};

  const toProcess = uniqueFinished
    .filter((e) => !cache.processed[e.idEvent])
    .slice(0, MAX_NEW_MATCHES_PER_RUN);

  console.log(`Нови приключили мачове за обработка: ${toProcess.length}`);

  for (const ev of toProcess) {
    try {
      const timeline = await getTimeline(ev.idEvent);
      for (const entry of timeline) {
        if (!isGoalEntry(entry)) continue;
        const player = entry.strPlayer?.trim();
        if (!player) continue;
        const teamId = entry.idTeam;
        const teamName =
          teamId === ev.idHomeTeam ? ev.strHomeTeam : teamId === ev.idAwayTeam ? ev.strAwayTeam : entry.strTeam || "";
        const teamBadge =
          teamId === ev.idHomeTeam ? ev.strHomeTeamBadge : teamId === ev.idAwayTeam ? ev.strAwayTeamBadge : undefined;
        const key = `${player}__${teamName}`;
        if (!cache.goalsByPlayer[key]) {
          cache.goalsByPlayer[key] = { player, team: teamName, teamBadge, goals: 0 };
        }
        cache.goalsByPlayer[key].goals += 1;
      }
      cache.processed[ev.idEvent] = true;
    } catch (err) {
      console.warn(`Пропуснат мач ${ev.idEvent}: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");

  const list = Object.values(cache.goalsByPlayer)
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 30);

  await writeFile(
    OUT_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        processedMatches: Object.keys(cache.processed).length,
        totalMatches: uniqueFinished.length,
        note: "Ориентировъчна класация от безплатния API (частичен timeline на мача).",
        list,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`Готово. Обработени мачове общо: ${Object.keys(cache.processed).length}/${uniqueFinished.length}.`);
}

main().catch((err) => {
  console.error("Грешка при изчисляване на голмайсторите:", err);
  process.exit(1);
});
