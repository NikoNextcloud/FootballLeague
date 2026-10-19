#!/usr/bin/env python3
"""Fetch bulgarian-football.com and export normalized local football data.

The app should not scrape websites from the browser. This bot fetches a small
set of source pages, parses them defensively, and writes JSON for the frontend.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import tempfile
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


BASE_URL = "https://bulgarian-football.com"
PAGES = {
    "parva_liga": f"{BASE_URL}/parva-liga.html",
    "europe": f"{BASE_URL}/evroturniri.html",
    "today": f"{BASE_URL}/machovete-dnes.html",
}
OUT_PATH = Path("data/bulgarian-football.json")
USER_AGENT = "FootballLeagueBot/1.0 (+https://github.com/NikoNextcloud/FootballLeague)"
MONTHS = {
    "януари": "01",
    "февруари": "02",
    "март": "03",
    "април": "04",
    "май": "05",
    "юни": "06",
    "юли": "07",
    "август": "08",
    "септември": "09",
    "октомври": "10",
    "ноември": "11",
    "декември": "12",
}
TEAM_ALIASES = {
    "Лудогорец 1945": "Лудогорец",
    "Левски (София)": "Левски",
    "ЦСКА (София)": "ЦСКА",
    "ФК ЦСКА 1948": "ЦСКА 1948",
    "Арда 1924": "Арда",
    "Ботев (Пловдив)": "Ботев Пловдив",
    "Ботев (Враца)": "Ботев Враца",
    "Черно море": "Черно море",
    "Славия 1913": "Славия",
    "Локомотив 1926": "Локомотив Пловдив",
    "Локомотив София 1929": "Локомотив София",
    "Спартак 1918": "Спартак Варна",
    "Септември (София)": "Септември София",
    "Дунав от Русе": "Дунав Русе",
}


@dataclass
class Page:
    key: str
    url: str
    html: str
    lines: list[str]
    sha256: str


def fetch_url(url: str, retries: int = 3) -> str:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
            with urlopen(request, timeout=25) as response:
                raw = response.read()
                encoding = response.headers.get_content_charset() or "utf-8"
                return raw.decode(encoding, "replace")
        except URLError as error:
            last_error = error
            time.sleep(2 + attempt * 2)
    raise RuntimeError(f"Cannot fetch {url}: {last_error}")


def html_to_lines(source: str) -> list[str]:
    source = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", source, flags=re.I | re.S)
    text = re.sub(r"(?i)<br\s*/?>", "\n", source)
    text = re.sub(r"(?i)</(p|div|li|tr|h\d|table|pre)>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    return [line for line in lines if line and "adsbygoogle" not in line]


def fetch_pages() -> dict[str, Page]:
    pages: dict[str, Page] = {}
    for key, url in PAGES.items():
        try:
            source = fetch_url(url)
        except (RuntimeError, TimeoutError, OSError):
            if key == "parva_liga":
                raise
            continue
        pages[key] = Page(
            key=key,
            url=url,
            html=source,
            lines=html_to_lines(source),
            sha256=hashlib.sha256(source.encode("utf-8", "replace")).hexdigest(),
        )
        time.sleep(1)
    return pages


def clean_team(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip()
    for src, dst in TEAM_ALIASES.items():
        if name.startswith(src):
            return dst
    name = re.sub(r"\s*\([^)]*\)", lambda m: m.group(0) if "София" in m.group(0) else "", name).strip()
    return name


def parse_bg_date(line: str) -> tuple[str, str, str] | None:
    # Dates with an unannounced kickoff still represent real fixtures.
    match = re.search(r"(\d{1,2})\s+([а-я]+)\s+(\d{4})\s+г\.", line, re.I)
    if not match:
        return None
    day, month_name, year = match.groups()
    month = MONTHS.get(month_name.lower())
    if not month:
        return None
    try:
        date_value = dt.date(int(year), int(month), int(day)).isoformat()
    except ValueError:
        return None
    kickoff = re.search(r"\b(\d{1,2}):(\d{2})\s*ч", line)
    time_value = ""
    if kickoff:
        hour, minute = map(int, kickoff.groups())
        if hour > 23 or minute > 59:
            return None
        time_value = f"{hour:02d}:{minute:02d}:00"
    round_match = re.search(r"/\s*([^:]+кръг[^:]*)", line)
    return date_value, time_value, round_match.group(1).strip() if round_match else ""


def parse_match_line(line: str, current_date: str = "", current_time: str = "", current_round: str = "") -> dict[str, Any] | None:
    if " - " not in line:
        return None
    clean = re.sub(r"\s*/.*$", "", line).strip()
    pattern = re.compile(r"^(.*?)\s+-\s+(.*?)\s+(?:(\d+)\s*:\s*(\d+)(?:\s*\(([^)]*)\))?|-\s*)")
    match = pattern.search(clean)
    if not match:
        return None
    home, away, hs, away_score, halftime = match.groups()
    home = clean_team(home)
    away = clean_team(away)
    if not home or not away:
        return None
    event: dict[str, Any] = {
        "id": stable_id(current_date, home, away, current_round),
        "dateEvent": current_date,
        "strTime": current_time,
        "intRound": round_to_number(current_round),
        "roundLabel": current_round,
        "strHomeTeam": home,
        "strAwayTeam": away,
        "source": "bulgarian-football.com",
        "timezone": "Europe/Sofia",
        "timeConfirmed": bool(current_time),
        "status": "finished" if hs is not None else ("postponed" if "отложен" in line.lower() else "scheduled"),
    }
    if current_date and current_time:
        event["kickoffAt"] = dt.datetime.fromisoformat(f"{current_date}T{current_time}").replace(tzinfo=ZoneInfo("Europe/Sofia")).isoformat()
    if hs is not None and away_score is not None:
        event["intHomeScore"] = hs
        event["intAwayScore"] = away_score
        event["halftime"] = halftime or ""
    else:
        event["intHomeScore"] = None
        event["intAwayScore"] = None
    return event


def stable_id(date_value: str, home: str, away: str, round_value: str = "", namespace: str = "") -> str:
    # A rescheduled match keeps its identity; the numeric round avoids variants
    # such as “X кръг - отложен мач” duplicating the same fixture.
    round_number = round_to_number(round_value)
    raw = f"{namespace}|{round_number or date_value}|{home}|{away}|{round_number or round_value}".lower()
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]
    return f"bf-{digest}"


def round_to_number(value: str) -> str:
    match = re.search(r"\b(\d+|[IVXLCDM]+)\s+кръг", value, re.I)
    if not match:
        return ""
    token = match.group(1).upper()
    if token.isdigit():
        return str(int(token))
    roman = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    result = previous = 0
    for letter in reversed(token):
        number = roman[letter]
        result += -number if number < previous else number
        previous = max(previous, number)
    return str(result)


def parse_standings(lines: list[str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    in_table = False
    last_rank = 0
    for line in lines:
        if line.startswith("Класиране:"):
            in_table = True
            continue
        if in_table and (line.startswith("Бележки") or line.startswith("Голмайстори")):
            break
        if not in_table or re.match(r"^-", line) or line.startswith("М П"):
            continue
        match = re.match(r"(?:(\d+)\.|\.)\s+(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+):(\d+)\s+(-?\d+)", line)
        if not match:
            continue
        rank, team, played, wins, draws, losses, gf, ga, points = match.groups()
        if rank:
            last_rank = int(rank)
        rows.append({
            "intRank": last_rank,
            "strTeam": clean_team(team),
            "intPlayed": int(played),
            "intWin": int(wins),
            "intDraw": int(draws),
            "intLoss": int(losses),
            "intGoalsFor": int(gf),
            "intGoalsAgainst": int(ga),
            "intGoalDifference": int(gf) - int(ga),
            "intPoints": int(points),
        })
    return rows


def parse_matches(lines: list[str]) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    current_date = current_time = current_round = ""
    active = False
    for line in lines:
        if line.startswith("Таблица с резултати"):
            break
        heading = re.match(r"^(?:[IVXLCDM]+|\d+)\s+кръг\b", line)
        if heading:
            current_round = line
            current_date = current_time = ""
            active = True
            continue
        if line.startswith("Актуални мачове"):
            current_round = current_date = current_time = ""
            active = True
            continue
        if line.startswith(("Класиране:", "Голмайстори", "Сухи мрежи", "Асистенции")):
            active = False
            current_round = current_date = current_time = ""
            continue
        parsed_date = parse_bg_date(line)
        if parsed_date and (active or current_round):
            current_date, current_time, parsed_round = parsed_date
            current_round = parsed_round or current_round
            active = bool(current_round)
            continue
        if active and current_date:
            event = parse_match_line(line, current_date, current_time, current_round)
            if event:
                events.append(event)
    return dedupe_events(events)


def dedupe_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for event in events:
        current = by_id.get(event["id"])
        if current and current.get("intHomeScore") is not None and event.get("intHomeScore") is None:
            continue
        if current and event.get("intHomeScore") is not None and current.get("intHomeScore") is not None:
            if (current["intHomeScore"], current["intAwayScore"]) != (event["intHomeScore"], event["intAwayScore"]):
                raise ValueError(f"Conflicting results for {event['id']}")
        by_id[event["id"]] = event
    return sorted(by_id.values(), key=lambda e: f"{e.get('dateEvent','')}{e.get('strTime','')}{e.get('strHomeTeam','')}")


def parse_scorers(lines: list[str]) -> list[dict[str, Any]]:
    scorers: list[dict[str, Any]] = []
    active = False
    current_goals = 0
    for line in lines:
        if line.startswith("Голмайстори"):
            active = True
            continue
        if active and (line.startswith("Сухи мрежи") or line.startswith("Асистенции") or re.match(r"^[IVX]+ кръг$", line)):
            break
        if not active:
            continue
        match = re.match(r"(?:(\d+)\s+-|-)\s+(.+?)\s+-\s+(.+?)(?:\s+\[.*)?$", line)
        if not match:
            continue
        goals, player, team = match.groups()
        if goals:
            current_goals = int(goals)
        if current_goals:
            scorers.append({"player": player.strip(), "team": clean_team(team), "goals": current_goals})
    return scorers


def parse_today_matches(page: Page) -> list[dict[str, Any]]:
    date_match = re.search(r'setDate",\s*"(\d{4}-\d{2}-\d{2})"', page.html)
    date_value = date_match.group(1) if date_match else dt.datetime.now(ZoneInfo("Europe/Sofia")).date().isoformat()
    events: list[dict[str, Any]] = []
    competition = ""
    for line in page.lines:
        timed = re.match(r"^(\d{1,2}):(\d{2})\s+(.+)$", line)
        if timed:
            hour, minute, rest = timed.groups()
            if int(hour) > 23 or int(minute) > 59:
                continue
            event = parse_match_line(rest, date_value, f"{int(hour):02d}:{minute}:00", competition)
            if event:
                event["competition"] = competition
                events.append(event)
            continue
        if not any(skip in line for skip in ["Начало", "window.", "function", "datepicker", "bulgarian-football.com"]):
            if not re.match(r"^\d", line) and len(line) < 80 and any(token in line.lower() for token in ["лига", "срещи", "купа"]):
                competition = line
    return dedupe_events(events)


def parse_europe(lines: list[str], bg_teams: set[str] | None = None) -> dict[str, Any]:
    participants: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []
    current_date = current_time = current_round = ""
    current_competition = current_leg = ""
    bg_teams = bg_teams or set(TEAM_ALIASES.values())
    competitions = {"Шампионска лига", "Лига Европа", "Лига на конференциите", "Юношеска лига"}
    for line in lines:
        if line in competitions:
            current_competition = line
            current_round = current_leg = current_date = current_time = ""
            continue
        if not current_competition:
            continue
        if ("квалификационен кръг" in line.lower() or line in {"Плейоф", "Групова фаза", "Шампионатна фаза"}
                or re.match(r"^(?:[IVXLCDM]+|\d+)\s+кръг$", line)):
            current_round = line
            current_leg = current_date = current_time = ""
            continue
        if line in {"Първа среща", "Реванш"}:
            current_leg = line
            current_date = current_time = ""
            continue
        parsed_date = parse_bg_date(line)
        if parsed_date:
            current_date, current_time, parsed_round = parsed_date
            if parsed_round:
                current_round = parsed_round
                current_leg = ""
            continue
        if not current_date:
            continue
        event = parse_match_line(line, current_date, current_time, current_round)
        if not event or not ({event["strHomeTeam"], event["strAwayTeam"]} & bg_teams):
            continue
        event["competition"] = current_competition
        event["roundLabel"] = " · ".join(x for x in [current_round, current_leg] if x)
        event["id"] = stable_id(current_date, event["strHomeTeam"], event["strAwayTeam"], event["roundLabel"], current_competition)
        events.append(event)
        for team in (event["strHomeTeam"], event["strAwayTeam"]):
            if team in bg_teams and not any(p["team"] == team and p["competition"] == current_competition for p in participants):
                participants.append({"team": team, "competition": current_competition})
    return {"participants": participants, "events": dedupe_events(events)}


def infer_competition(lines: list[str], line: str) -> str:
    idx = lines.index(line) if line in lines else -1
    window = " ".join(lines[max(0, idx - 8):idx + 1])
    if "Шампионска" in window:
        return "Шампионска лига"
    if "Лига Европа" in window:
        return "Лига Европа"
    if "конференци" in window.lower():
        return "Лига на конференциите"
    return "Евротурнири"


def extract_season(page: Page) -> str:
    heading = re.search(r"<h1\b[^>]*>(.*?)</h1>", page.html, re.I | re.S)
    title = html.unescape(re.sub(r"<[^>]+>", " ", heading.group(1))) if heading else " ".join(page.lines[:1])
    match = re.search(r"\b(20\d{2})/(\d{2}|20\d{2})\b", title)
    if not match:
        raise ValueError("The source season could not be identified; refusing to replace saved data.")
    first, second = match.groups()
    end = int(second) if len(second) == 4 else int(first[:2] + second)
    if end != int(first) + 1:
        raise ValueError("Invalid source season")
    return f"{first}-{end}"


def validate_payload(payload: dict[str, Any], previous: dict[str, Any] | None = None) -> None:
    rows = payload["table"]
    if not 10 <= len(rows) <= 24:
        raise ValueError(f"Unexpected standings size: {len(rows)}")
    names = [row["strTeam"] for row in rows]
    if len(set(names)) != len(names):
        raise ValueError("Duplicate clubs in standings")
    for row in rows:
        if row["intPlayed"] != row["intWin"] + row["intDraw"] + row["intLoss"]:
            raise ValueError(f"Inconsistent W/D/L totals for {row['strTeam']}")
        # Points may legitimately include deductions or administrative decisions.
        if any(row[key] < 0 for key in ("intPlayed", "intWin", "intDraw", "intLoss", "intGoalsFor", "intGoalsAgainst")):
            raise ValueError("Negative match or goal statistics")
    if {row["intRank"] for row in rows} != set(range(1, len(rows) + 1)):
        raise ValueError("Missing or duplicate published ranks")
    events = payload["events"]
    if not events:
        raise ValueError("No league fixtures parsed")
    for event in events:
        if event["strHomeTeam"] not in names or event["strAwayTeam"] not in names:
            raise ValueError(f"Fixture club missing from standings: {event}")
        if event["strHomeTeam"] == event["strAwayTeam"]:
            raise ValueError("Fixture contains the same team twice")
        dt.date.fromisoformat(event["dateEvent"])
        if not event.get("intRound"):
            raise ValueError("Fixture round missing")
        scores = [event.get("intHomeScore"), event.get("intAwayScore")]
        if (scores[0] is None) != (scores[1] is None):
            raise ValueError("Incomplete score")
        if scores[0] is not None and any(not str(value).isdigit() for value in scores):
            raise ValueError("Invalid score")
    if previous and previous.get("table") and previous.get("season", payload["season"]) == payload.get("season"):
        if len(rows) != len(previous.get("table", [])):
            raise ValueError("Standings club count unexpectedly changed within the season")
        if len(events) < len(previous.get("events", [])) * 0.8:
            raise ValueError("More than 20% of fixtures disappeared; keeping the previous snapshot")


def inspect_source_consistency(payload: dict[str, Any]) -> dict[str, Any]:
    """Compare source sections without deriving or replacing official ranking/points.

    A mismatch may be a partial source update or an administrative decision; it
    is observable evidence rather than a reason to invent corrected standings.
    """
    fields = ("intPlayed", "intWin", "intDraw", "intLoss", "intGoalsFor", "intGoalsAgainst")
    totals = {row["strTeam"]: {key: 0 for key in fields} for row in payload["table"]}
    completed = 0
    for event in payload["events"]:
        if event.get("intHomeScore") is None or event.get("intAwayScore") is None:
            continue
        if event.get("status") in {"postponed", "cancelled", "abandoned", "suspended", "live"}:
            continue
        completed += 1
        home, away = int(event["intHomeScore"]), int(event["intAwayScore"])
        for team, own, other in ((event["strHomeTeam"], home, away), (event["strAwayTeam"], away, home)):
            row = totals[team]
            row["intPlayed"] += 1
            row["intWin"] += int(own > other)
            row["intDraw"] += int(own == other)
            row["intLoss"] += int(own < other)
            row["intGoalsFor"] += own
            row["intGoalsAgainst"] += other
    mismatches = []
    for row in payload["table"]:
        differences = {key: {"published": row[key], "fromResults": totals[row["strTeam"]][key]}
                       for key in fields if row[key] != totals[row["strTeam"]][key]}
        if differences:
            mismatches.append({"team": row["strTeam"], "differences": differences})
    return {"status": "consistent" if not mismatches else "mismatch", "checkedTeams": len(totals),
            "completedMatches": completed, "comparedFields": list(fields), "mismatches": mismatches}


def build_payload(pages: dict[str, Page], previous: dict[str, Any] | None = None) -> dict[str, Any]:
    parva = pages["parva_liga"].lines
    checked = dt.datetime.now(dt.timezone.utc).isoformat()
    season = extract_season(pages["parva_liga"])
    retained = previous or {}
    if retained.get("season", season) != season:
        retained = {}  # Never carry European/today sections into a different season.
    payload = {
        "schemaVersion": 2,
        "source": "bulgarian-football.com",
        "sourceUrl": PAGES["parva_liga"],
        "season": season,
        "timezone": "Europe/Sofia",
        "updatedAt": checked,
        "lastSuccessAt": checked,
        "standingsPolicy": "published-source-order",
        "pages": {key: {"url": page.url, "sha256": page.sha256, "checkedAt": checked} for key, page in pages.items()},
        "table": parse_standings(parva),
        "events": parse_matches(parva),
        "scorers": parse_scorers(parva),
        "today": parse_today_matches(pages["today"]) if "today" in pages else retained.get("today", []),
        "europe": parse_europe(pages["europe"].lines, {row["strTeam"] for row in parse_standings(parva)}) if "europe" in pages else retained.get("europe", {"participants": [], "events": []}),
        "warnings": [],
    }
    for key in ("today", "europe"):
        if key not in pages:
            section = "Днешните мачове" if key == "today" else "Европейските мачове"
            detail = "Показани са последните запазени данни." if retained.get(key) else "Няма запазени данни за този сезон."
            payload["warnings"].append(f"{section}: източникът временно е недостъпен. {detail}")
            if key in retained.get("pages", {}):
                payload["pages"][key] = {**retained["pages"][key], "stale": True}
    # HTTP 200 is not proof of a successfully parsed section: anti-bot pages
    # and changed markup can otherwise erase previously verified fixtures.
    if ("europe" in pages and not payload["europe"].get("events")
            and retained.get("europe", {}).get("events")):
        payload["europe"] = retained["europe"]
        saved_page = retained.get("pages", {}).get("europe", {})
        payload["pages"]["europe"] = {
            **saved_page,
            "url": saved_page.get("url", PAGES["europe"]),
            "checkedAt": saved_page.get("checkedAt", retained.get("lastSuccessAt", retained.get("updatedAt"))),
            "lastAttemptAt": checked,
            "stale": True,
            "staleReason": "empty-parse",
        }
        payload["warnings"].append("Европейските мачове не можаха да бъдат разчетени от източника. Показани са последните запазени данни за този сезон.")
    validate_payload(payload, previous)
    payload["integrity"] = inspect_source_consistency(payload)
    if payload["integrity"]["status"] == "mismatch":
        count = len(payload["integrity"]["mismatches"])
        payload["warnings"].append(f"Разминаване между публикуваното класиране и резултатите за {count} отбора. Запазени са точките и местата от източника; възможно е текущо обновяване или административно решение.")
    return payload


def write_json(payload: dict[str, Any], path: Path) -> None:
    # Failed writes must never truncate the last good snapshot.
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as file:
            temporary = file.name
            json.dump(payload, file, ensure_ascii=False, indent=2)
            file.write("\n")
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary, path)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(OUT_PATH), help="JSON output path")
    parser.add_argument("--validate-only", action="store_true", help="Validate the saved snapshot without network access")
    args = parser.parse_args()
    path = Path(args.out)
    try:
        previous = json.loads(path.read_text(encoding="utf-8")) if path.exists() else None
        if args.validate_only:
            if previous is None:
                raise ValueError("No saved snapshot to validate")
            validate_payload(previous)
            print("Saved football snapshot is valid.")
            return 0
        payload = build_payload(fetch_pages(), previous)
        write_json(payload, path)
    except (ValueError, RuntimeError, TimeoutError, OSError) as error:
        print(f"Refresh failed; the previous snapshot was preserved: {error}", file=sys.stderr)
        return 1
    print(json.dumps({
        "updatedAt": payload["updatedAt"],
        "season": payload["season"],
        "tableRows": len(payload["table"]),
        "events": len(payload["events"]),
        "scorers": len(payload["scorers"]),
        "warnings": payload["warnings"],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
