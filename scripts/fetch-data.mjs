// scripts/fetch-data.mjs
// Извлича данни за efbet Лига (А група) от TheSportsDB и ги записва в public/data/*.json
// Ползва се локално (npm run fetch-data) и от GitHub Actions (виж .github/workflows/update-data.yml)

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3"; // безплатен споделен ключ
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const LEAGUE_ID = "4626"; // Bulgarian First League (efbet Лига / А група)
const OUT_DIR = path.resolve("public/data");

// Текущият футболен сезон в България тръгва през юли и свършва през май
function currentSeason() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1; // 1-12
  const startYear = m >= 7 ? y : y - 1;
  return `${startYear}-${startYear + 1}`;
}

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "a-grupa-site/1.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status} за ${url}`);
      return await res.json();
    } catch (err) {
      console.warn(`Опит ${i + 1} неуспешен за ${url}:`, err.message);
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const season = currentSeason();
  console.log(`Извличане на данни за сезон ${season}, лига ${LEAGUE_ID}...`);

  const [table, seasonEvents, teams, nextEvents, pastEvents] = await Promise.all([
    getJSON(`${BASE}/lookuptable.php?l=${LEAGUE_ID}&s=${season}`),
    getJSON(`${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${season}`),
    getJSON(`${BASE}/lookup_all_teams.php?id=${LEAGUE_ID}`),
    getJSON(`${BASE}/eventsnextleague.php?id=${LEAGUE_ID}`),
    getJSON(`${BASE}/eventspastleague.php?id=${LEAGUE_ID}`),
  ]);

  const payload = {
    meta: {
      season,
      leagueId: LEAGUE_ID,
      updatedAt: new Date().toISOString(),
      source: "TheSportsDB",
    },
    table: table?.table || [],
    events: seasonEvents?.events || [],
    teams: teams?.teams || [],
    next: nextEvents?.events || [],
    past: pastEvents?.events || [],
  };

  await writeFile(path.join(OUT_DIR, "league.json"), JSON.stringify(payload, null, 2), "utf-8");
  console.log(
    `Готово: ${payload.table.length} отбора в класирането, ${payload.events.length} мача за сезона, ${payload.teams.length} отбора.`
  );

  if (!payload.table.length && !payload.events.length) {
    console.warn(
      "⚠️ Празни данни — възможно е сезонът все още да не е зареден при TheSportsDB или ключът да е ограничен. Файлът е записан, но е празен."
    );
  }
}

main().catch((err) => {
  console.error("Грешка при извличане на данните:", err);
  process.exit(1);
});
