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
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen


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
    text = re.sub(r"(?i)<br\s*/?>", "\n", source)
    text = re.sub(r"(?i)</(p|div|li|tr|h\d|table|pre)>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    return [line for line in lines if line and "adsbygoogle" not in line]


def fetch_pages() -> dict[str, Page]:
    pages: dict[str, Page] = {}
    for key, url in PAGES.items():
        source = fetch_url(url)
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
    match = re.search(r"(\d{1,2})\s+([а-я]+)\s+(\d{4})\s+г\.,.*?(\d{1,2}:\d{2})\s+ч(?:\s*/\s*([^:]+))?", line, re.I)
    if not match:
        return None
    day, month_name, year, time_value, round_value = match.groups()
    month = MONTHS.get(month_name.lower())
    if not month:
        return None
    return f"{year}-{month}-{int(day):02d}", f"{time_value}:00", (round_value or "").strip()


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
    }
    if hs is not None and away_score is not None:
        event["intHomeScore"] = hs
        event["intAwayScore"] = away_score
        event["halftime"] = halftime or ""
    else:
        event["intHomeScore"] = None
        event["intAwayScore"] = None
    return event


def stable_id(date_value: str, home: str, away: str, round_value: str = "") -> str:
    raw = f"{date_value}|{home}|{away}|{round_value}".lower()
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]
    return f"bf-{digest}"


def round_to_number(value: str) -> str:
    roman = {"I": "1", "II": "2", "III": "3", "IV": "4", "V": "5", "VI": "6", "VII": "7", "VIII": "8", "IX": "9", "X": "10"}
    m = re.search(r"\b([IVX]+)\s+кръг", value)
    if m:
        return roman.get(m.group(1), "")
    m = re.search(r"\b(\d+)\s*кръг", value)
    return m.group(1) if m else ""


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
        match = re.match(r"(?:(\d+)\.|\.)\s+(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+):(\d+)\s+(\d+)", line)
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
    in_notes = False
    expect_match = False
    for line in lines:
        if line.startswith("Актуални мачове") or re.match(r"^[IVX]+ кръг$", line):
            active = True
            in_notes = False
            if re.match(r"^[IVX]+ кръг$", line):
                current_round = line
            continue
        if line.startswith("Бележки"):
            in_notes = True
            continue
        if in_notes and re.match(r"^[IVX]+ кръг$", line):
            in_notes = False
            active = True
            current_round = line
            continue
        if line.startswith("Класиране:") or in_notes:
            active = False
            continue
        parsed_date = parse_bg_date(line)
        if parsed_date:
            current_date, current_time, parsed_round = parsed_date
            if parsed_round:
                current_round = parsed_round
            active = True
            expect_match = True
            continue
        if active and expect_match:
            event = parse_match_line(line, current_date, current_time, current_round)
            if event:
                events.append(event)
                expect_match = False
    return dedupe_events(events)


def dedupe_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for event in events:
        current = by_id.get(event["id"])
        if not current or event.get("intHomeScore") is not None:
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
    date_value = date_match.group(1) if date_match else dt.date.today().isoformat()
    events: list[dict[str, Any]] = []
    competition = ""
    for line in page.lines:
        if re.match(r"^\d{1,2}:\d{2}\s+", line):
            time_value, rest = line[:5], line[6:]
            event = parse_match_line(rest, date_value, f"{time_value}:00", competition)
            if event:
                event["competition"] = competition
                events.append(event)
            continue
        if not any(skip in line for skip in ["Начало", "window.", "function", "datepicker", "bulgarian-football.com"]):
            if not re.match(r"^\d", line) and len(line) < 80 and any(token in line.lower() for token in ["лига", "срещи", "купа"]):
                competition = line
    return dedupe_events(events)


def parse_europe(lines: list[str]) -> dict[str, Any]:
    participants = []
    events = []
    current_date = current_time = current_round = ""
    current_competition = ""
    current_leg = ""
    competitions = {"Шампионска лига", "Лига Европа", "Лига на конференциите", "Юношеска лига"}
    for line in lines:
        if line in competitions:
            current_competition = line
            current_round = ""
            current_leg = ""
            continue
        if "квалификационен кръг" in line.lower() or line in {"Плейоф", "Групова фаза"}:
            current_round = line
            continue
        if line in {"Първа среща", "Реванш"}:
            current_leg = line
            continue
        if current_competition:
            for team in ["Левски", "ЦСКА", "Лудогорец", "ЦСКА 1948", "Арда", "Черно море"]:
                if team in line and not any(p["team"] == team for p in participants):
                    participants.append({"team": team, "competition": current_competition, "line": line})
        parsed_date = parse_bg_date(line)
        if parsed_date:
            current_date, current_time, parsed_round = parsed_date
            if parsed_round:
                current_round = parsed_round
            continue
        event = parse_match_line(line, current_date, current_time, current_round)
        if event:
            event["competition"] = current_competition or infer_competition(lines, line)
            event["roundLabel"] = " · ".join([x for x in [current_round, current_leg] if x])
            events.append(event)
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


def build_payload(pages: dict[str, Page]) -> dict[str, Any]:
    parva = pages["parva_liga"].lines
    europe = pages["europe"].lines
    today = pages["today"].lines
    payload = {
        "schemaVersion": 1,
        "source": "bulgarian-football.com",
        "updatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "pages": {key: {"url": page.url, "sha256": page.sha256} for key, page in pages.items()},
        "table": parse_standings(parva),
        "events": parse_matches(parva),
        "scorers": parse_scorers(parva),
        "today": parse_today_matches(pages["today"]),
        "europe": parse_europe(europe),
        "warnings": [],
    }
    if len(payload["table"]) < 10:
        payload["warnings"].append("Parsed standings have fewer than 10 teams.")
    if not payload["events"]:
        payload["warnings"].append("No league events parsed.")
    return payload


def write_json(payload: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")



def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(OUT_PATH), help="JSON output path")
    args = parser.parse_args()

    pages = fetch_pages()
    payload = build_payload(pages)
    write_json(payload, Path(args.out))

    print(json.dumps({
        "updatedAt": payload["updatedAt"],
        "tableRows": len(payload["table"]),
        "events": len(payload["events"]),
        "scorers": len(payload["scorers"]),
        "warnings": payload["warnings"],
    }, ensure_ascii=False))
    return 0 if not payload["warnings"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
