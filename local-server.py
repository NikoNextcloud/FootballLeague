import json
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlsplit
from urllib.parse import parse_qs, urlencode


API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
API_FOOTBALL_KEY = "5fe9a89fb3bd8f9c526e1dadfaacbb73"
ALLSPORTS_BASE = "https://apiv2.allsportsapi.com/football/"
ALLSPORTS_KEY = "4bff69d7acdcd7fe4e1110217bb5f89cefe5ab26d5e52b9e6c8cbf250e839e2d"
API_FOOTBALL_SEASON = 2026
EUROPE_LEAGUES = {
    2: {"name": "Шампионска лига", "cls": "ucl"},
    3: {"name": "Лига Европа", "cls": "uel"},
    848: {"name": "Лига на конференциите", "cls": "uecl"},
}
EUROPE_TEAM_IDS = {566, 646, 634, 1415, 1430, 1426, 853}
BG_TEAM_NAMES = {
    "ludogorets", "ludogorets razgrad", "levski", "levski sofia", "cska", "cska sofia",
    "cska 1948", "arda", "arda kardzhali", "cherno more", "cherno more varna",
    "botev plovdiv", "lokomotiv plovdiv", "lokomotiv sofia", "slavia sofia",
    "spartak varna", "septemvri sofia", "dunav ruse", "botev vratsa",
}
EUROPE_TEAM_SEARCHES = ["Ludogorets", "Levski", "CSKA Sofia", "CSKA 1948"]
EUROPE_CACHE = {"expires": 0, "body": None}
ALLSPORTS_CACHE = {}


class FootballLeagueHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/allsports/live"):
            self.send_allsports_live()
            return
        if self.path.startswith("/allsports/europe"):
            self.send_allsports_europe()
            return
        if self.path.startswith("/allsports/match"):
            self.send_allsports_match()
            return
        if self.path.startswith("/api-football/europe"):
            self.send_api_football_europe()
            return
        if self.path.startswith("/api-football/"):
            self.proxy_api_football()
            return
        super().do_GET()

    def send_json(self, status, body):
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def fetch_api_football(self, endpoint):
        request = Request(f"{API_FOOTBALL_BASE}/{endpoint}", headers={
            "x-apisports-key": API_FOOTBALL_KEY,
            "Accept": "application/json",
            "User-Agent": "FootballLeagueLocal/1.0",
        })
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))

    def fetch_allsports(self, params):
        params = {**params, "APIkey": ALLSPORTS_KEY}
        url = f"{ALLSPORTS_BASE}?{urlencode(params)}"
        request = Request(url, headers={
            "Accept": "application/json",
            "User-Agent": "FootballLeagueLocal/1.0",
        })
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))

    def cached_allsports(self, key, params, ttl=300):
        now = time.time()
        hit = ALLSPORTS_CACHE.get(key)
        if hit and hit["expires"] > now:
            return hit["data"]
        data = self.fetch_allsports(params)
        ALLSPORTS_CACHE[key] = {"expires": now + ttl, "data": data}
        return data

    def is_bg_match(self, item):
        names = [
            item.get("event_home_team", ""),
            item.get("event_away_team", ""),
            item.get("home_team_name", ""),
            item.get("away_team_name", ""),
        ]
        text = " ".join(names).lower()
        return any(name in text for name in BG_TEAM_NAMES) or item.get("country_name") == "Bulgaria"

    def normalize_allsports_match(self, item):
        return {
            "id": str(item.get("event_key") or ""),
            "dateEvent": item.get("event_date") or "",
            "strTime": item.get("event_time") or "",
            "home": item.get("event_home_team") or "",
            "away": item.get("event_away_team") or "",
            "homeLogo": item.get("home_team_logo") or "",
            "awayLogo": item.get("away_team_logo") or "",
            "score": item.get("event_final_result") or item.get("event_ft_result") or "",
            "status": item.get("event_status") or "",
            "live": str(item.get("event_live") or "0") == "1",
            "league": item.get("league_name") or "",
            "country": item.get("country_name") or "",
            "round": item.get("league_round") or "",
            "stadium": item.get("event_stadium") or "",
            "referee": item.get("event_referee") or "",
        }

    def send_allsports_live(self):
        try:
            data = self.cached_allsports("live", {"met": "Livescore", "timezone": "Europe/Sofia"}, ttl=45)
            matches = [self.normalize_allsports_match(x) for x in data.get("result", []) if self.is_bg_match(x)]
            self.send_json(200, {"response": matches, "results": len(matches)})
        except Exception as error:
            self.send_json(502, {"response": [], "results": 0, "error": str(error)})

    def send_allsports_europe(self):
        today = time.strftime("%Y-%m-%d")
        to_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + 90 * 86400))
        seen = set()
        matches = []
        for name in EUROPE_TEAM_SEARCHES:
            try:
                teams = self.cached_allsports(f"team:{name}", {"met": "Teams", "teamName": name}, ttl=86400).get("result", [])
            except Exception:
                teams = []
            for team in teams:
                team_id = team.get("team_key")
                if not team_id:
                    continue
                try:
                    data = self.cached_allsports(
                        f"fixtures:{team_id}:{today}:{to_date}",
                        {"met": "Fixtures", "teamId": team_id, "from": today, "to": to_date, "timezone": "Europe/Sofia"},
                        ttl=300,
                    )
                except Exception:
                    continue
                for item in data.get("result", []):
                    league = (item.get("league_name") or "").lower()
                    if not any(x in league for x in ["champions", "europa", "conference"]):
                        continue
                    event_id = str(item.get("event_key") or "")
                    if event_id in seen:
                        continue
                    seen.add(event_id)
                    matches.append(self.normalize_allsports_match(item))
        self.send_json(200, {"response": matches, "results": len(matches)})

    def send_allsports_match(self):
        parsed = urlsplit(self.path)
        qs = parse_qs(parsed.query)
        event_id = (qs.get("eventId") or [""])[0]
        date = (qs.get("date") or [""])[0]
        home = (qs.get("home") or [""])[0].lower()
        away = (qs.get("away") or [""])[0].lower()
        item = None
        if event_id:
            try:
                data = self.cached_allsports(f"match:{event_id}", {"met": "Fixtures", "matchId": event_id, "timezone": "Europe/Sofia"}, ttl=300)
                item = (data.get("result") or [None])[0]
            except Exception:
                item = None
        if not item and date and home and away:
            try:
                data = self.cached_allsports(f"fixtures-date:{date}", {"met": "Fixtures", "from": date, "to": date, "timezone": "Europe/Sofia"}, ttl=300)
                for candidate in data.get("result", []):
                    text = f"{candidate.get('event_home_team','')} {candidate.get('event_away_team','')}".lower()
                    if home in text or away in text:
                        item = candidate
                        break
            except Exception:
                item = None
        videos = []
        if item and item.get("event_key"):
            try:
                video_data = self.cached_allsports(f"videos:{item.get('event_key')}", {"met": "Videos", "eventId": item.get("event_key")}, ttl=1800)
                videos = video_data.get("result") or []
            except Exception:
                videos = []
        self.send_json(200, {"match": item or {}, "videos": videos})

    def send_api_football_europe(self):
        now = time.time()
        if EUROPE_CACHE["body"] is not None and EUROPE_CACHE["expires"] > now:
            self.send_json(200, EUROPE_CACHE["body"])
            return

        fixtures = []
        seen = set()
        for league_id, meta in EUROPE_LEAGUES.items():
            endpoint = f"fixtures?league={league_id}&season={API_FOOTBALL_SEASON}&timezone=Europe/Sofia"
            try:
                data = self.fetch_api_football(endpoint)
            except Exception:
                continue
            for item in data.get("response", []):
                home = item.get("teams", {}).get("home", {})
                away = item.get("teams", {}).get("away", {})
                if home.get("id") not in EUROPE_TEAM_IDS and away.get("id") not in EUROPE_TEAM_IDS:
                    continue
                fixture = item.get("fixture", {})
                fixture_id = fixture.get("id")
                if fixture_id in seen:
                    continue
                seen.add(fixture_id)
                status = fixture.get("status", {}) or {}
                goals = item.get("goals", {}) or {}
                date_value = fixture.get("date", "")
                date_part = date_value[:10]
                time_part = date_value[11:19] if len(date_value) >= 19 else ""
                score_available = status.get("short") in {"1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "FT", "AET", "PEN"}
                fixtures.append({
                    "id": f"api-{fixture_id}",
                    "competition": meta["name"],
                    "cls": meta["cls"],
                    "round": (item.get("league", {}).get("round") or "Европейски турнир").split(" - ")[-1],
                    "dateEvent": date_part,
                    "strTime": time_part,
                    "home": home.get("name") or "",
                    "away": away.get("name") or "",
                    "homeLogo": home.get("logo") or "",
                    "awayLogo": away.get("logo") or "",
                    "homeScore": goals.get("home") if score_available else None,
                    "awayScore": goals.get("away") if score_available else None,
                    "status": status.get("short") or "",
                    "elapsed": status.get("elapsed"),
                })

        body = {"response": fixtures, "results": len(fixtures)}
        EUROPE_CACHE["body"] = body
        EUROPE_CACHE["expires"] = now + 300
        self.send_json(200, body)

    def proxy_api_football(self):
        parsed = urlsplit(self.path)
        endpoint = parsed.path.replace("/api-football/", "", 1)
        url = f"{API_FOOTBALL_BASE}/{endpoint}"
        if parsed.query:
            url = f"{url}?{parsed.query}"

        request = Request(url, headers={
            "x-apisports-key": API_FOOTBALL_KEY,
            "Accept": "application/json",
            "User-Agent": "FootballLeagueLocal/1.0",
        })

        try:
            with urlopen(request, timeout=20) as response:
                body = response.read()
                self.send_response(response.status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
        except HTTPError as error:
            body = error.read() or b'{"errors":["API-Football request failed"]}'
            self.send_response(error.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        except URLError:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"errors":["API-Football is unreachable"]}')


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8080), FootballLeagueHandler)
    print("FootballLeague is running at http://127.0.0.1:8080")
    server.serve_forever()
