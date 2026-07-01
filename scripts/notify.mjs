// scripts/notify.mjs
//
// Push известия за начало на мач и голове — чрез OneSignal (безплатен push service,
// не изисква собствен сървър). Сравнява предишното състояние на league.json (снимка
// направена ПРЕДИ fetch-data.mjs да го презапише) с новото и праща push при промяна.
//
// Изисква GitHub secrets: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
// Ако липсват — скриптът тихо прескача (не чупи workflow-а).

import { readFile } from "node:fs/promises";

const APP_ID = process.env.ONESIGNAL_APP_ID;
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY;
const PREV_FILE = process.env.PREV_LEAGUE_FILE || "/tmp/league-before.json";
const CURR_FILE = process.env.CURR_LEAGUE_FILE || "public/data/league.json";

const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "LIVE", "In Play"]);

async function readJSON(file) {
  try {
    return JSON.parse(await readFile(file, "utf-8"));
  } catch {
    return null;
  }
}

async function sendPush(title, message, url) {
  if (!APP_ID || !REST_KEY) {
    console.log(`(пропуснато известие — липсват OneSignal secrets) ${title}: ${message}`);
    return;
  }
  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ["Subscribed Users"],
        headings: { bg: title, en: title },
        contents: { bg: message, en: message },
        url,
      }),
    });
    if (!res.ok) {
      console.warn(`OneSignal HTTP ${res.status}: ${await res.text()}`);
    } else {
      console.log(`Изпратено известие: ${title} — ${message}`);
    }
  } catch (err) {
    console.warn("Грешка при изпращане на известие:", err.message);
  }
}

function score(e) {
  const h = e.intHomeScore === "" || e.intHomeScore === null ? null : Number(e.intHomeScore);
  const a = e.intAwayScore === "" || e.intAwayScore === null ? null : Number(e.intAwayScore);
  return { h, a };
}

async function main() {
  const prev = await readJSON(PREV_FILE);
  const curr = await readJSON(CURR_FILE);

  if (!prev || !curr) {
    console.log("Няма предишна или текуща снимка на данните — пропускам известията.");
    return;
  }

  const prevById = new Map((prev.events || []).map((e) => [e.idEvent, e]));
  let notified = 0;

  for (const event of curr.events || []) {
    const before = prevById.get(event.idEvent);
    if (!before) continue;

    const wasLive = LIVE_STATUSES.has(before.strStatus);
    const isLive = LIVE_STATUSES.has(event.strStatus);

    // Начало на мач
    if (!wasLive && isLive) {
      await sendPush(
        "Мачът започна ⚽",
        `${event.strHomeTeam} — ${event.strAwayTeam} тръгна на живо!`,
        "#/machove"
      );
      notified++;
      continue;
    }

    // Гол (промяна в резултата по време на мач)
    const prevScore = score(before);
    const currScore = score(event);
    if (
      isLive &&
      currScore.h !== null &&
      currScore.a !== null &&
      (currScore.h !== prevScore.h || currScore.a !== prevScore.a)
    ) {
      await sendPush(
        "Гол! 🥅",
        `${event.strHomeTeam} ${currScore.h}:${currScore.a} ${event.strAwayTeam}`,
        "#/machove"
      );
      notified++;
    }
  }

  console.log(`Готово. Изпратени известия: ${notified}.`);
}

main().catch((err) => {
  console.error("Грешка в notify.mjs:", err);
  // Не прекъсваме целия workflow заради проблем с известията
  process.exit(0);
});
