// scripts/fetch-archive.mjs
// Изтегля класиране + мачове за предходни сезони (архив).
// Не е нужно да се пуска често — старите сезони не се променят.
// Пускане: node scripts/fetch-archive.mjs [брой_сезони_назад]

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const LEAGUE_ID = "4626";
const OUT_DIR = path.resolve("public/data/archive");
const YEARS_BACK = Number(process.argv[2] || 4);

function currentSeasonStartYear() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  return m >= 7 ? y : y - 1;
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const startYear = currentSeasonStartYear();
  const seasons = [];
  // от предходния сезон назад (текущият вече е в league.json)
  for (let i = 1; i <= YEARS_BACK; i++) {
    seasons.push(`${startYear - i}-${startYear - i + 1}`);
  }

  const index = [];

  for (const season of seasons) {
    console.log(`Извличане на архив за сезон ${season}...`);
    try {
      const [table, events] = await Promise.all([
        getJSON(`${BASE}/lookuptable.php?l=${LEAGUE_ID}&s=${season}`),
        getJSON(`${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${season}`),
      ]);
      const payload = {
        season,
        updatedAt: new Date().toISOString(),
        table: table?.table || [],
        events: events?.events || [],
      };
      if (!payload.table.length && !payload.events.length) {
        console.log(`  — няма данни за ${season}, пропускам.`);
        continue;
      }
      await writeFile(path.join(OUT_DIR, `${season}.json`), JSON.stringify(payload, null, 2), "utf-8");
      index.push(season);
      console.log(`  ✓ ${payload.table.length} отбора, ${payload.events.length} мача`);
    } catch (err) {
      console.warn(`  Грешка за сезон ${season}: ${err.message}`);
    }
    await sleep(500);
  }

  await writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify({ seasons: index }, null, 2), "utf-8");
  console.log(`Архивът е готов: ${index.length} сезона.`);
}

main().catch((err) => {
  console.error("Грешка при извличане на архива:", err);
  process.exit(1);
});
