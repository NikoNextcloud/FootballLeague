import json
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlsplit


API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
API_FOOTBALL_KEY = "5fe9a89fb3bd8f9c526e1dadfaacbb73"
API_FOOTBALL_SEASON = 2026
EUROPE_LEAGUES = {
    2: {"name": "Шампионска лига", "cls": "ucl"},
    3: {"name": "Лига Европа", "cls": "uel"},
    848: {"name": "Лига на конференциите", "cls": "uecl"},
}
EUROPE_TEAM_IDS = {566, 646, 634, 1415, 1430, 1426, 853}
EUROPE_CACHE = {"expires": 0, "body": None}


class FootballLeagueHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
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
