"""Offline regressions for source parsing and preservation of published facts."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("football_bot", Path(__file__).parents[1] / "scripts/bulgarian_football_bot.py")
bot = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = bot
SPEC.loader.exec_module(bot)


class FootballBotTests(unittest.TestCase):
    def test_all_roman_rounds_and_postponed_heading(self):
        for label, expected in [("XII кръг", "12"), ("XXVI кръг", "26"), ("XXXIV кръг", "34"), ("X кръг - отложен мач", "10"), ("26 кръг", "26")]:
            self.assertEqual(bot.round_to_number(label), expected)

    def test_date_only_does_not_invent_kickoff(self):
        self.assertEqual(bot.parse_bg_date("13 февруари 2027 г., събота:"), ("2027-02-13", "", ""))
        self.assertIsNone(bot.parse_bg_date("31 февруари 2027 г., 19:00 ч:"))
        self.assertIsNone(bot.parse_bg_date("1 март 2027 г., 25:00 ч:"))

    def test_shared_date_multiple_games_and_venue_lines(self):
        events = bot.parse_matches(["XVII кръг", "5 декември 2026 г., събота:",
            "Спартак 1918 (Варна) - Ботев (Пловдив) -", "в Ловеч, Градски стадион:",
            "Славия 1913 (София) - Ботев (Враца) -"])
        self.assertEqual(len(events), 2)
        self.assertTrue(all(event["intRound"] == "17" and event["strTime"] == "" for event in events))

    def test_rescheduled_fixture_deduplicates_and_keeps_round(self):
        events = bot.parse_matches(["X кръг", "1 октомври 2026 г., 19:00 ч:", "Левски (София) - Лудогорец 1945 (Разград) -",
            "XVI кръг", "X кръг - отложен мач", "3 декември 2026 г., 18:30 ч:", "Левски (София) - Лудогорец 1945 (Разград) -"])
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["intRound"], "10")
        self.assertEqual(events[0]["dateEvent"], "2026-12-03")

    def test_heading_clears_date_and_result_matrix_is_not_a_fixture(self):
        events = bot.parse_matches(["I кръг", "1 август 2026 г., 19:00 ч:", "Левски (София) - ЦСКА (София) 1:0", "II кръг", "Левски (София) - Славия 1913 (София) -", "Таблица с резултати", "1 август 2026 г., 19:00 ч:", "Левски (София) - ЦСКА (София) 9:0"])
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["intHomeScore"], "1")

    def test_published_tiebreak_order_and_points_are_preserved(self):
        rows = bot.parse_standings(["Класиране:", "1. Дунав от Русе (Русе) 11 2 2 7 13:21 8 [+] [2 1 0 7:5 7]", "2. Локомотив 1926 (Пловдив) 11 2 2 7 6:14 7", "Бележки"])
        self.assertEqual(rows[0]["strTeam"], "Дунав Русе")
        self.assertEqual(rows[1]["intPoints"], 7)  # A published deduction is not recalculated.

    def test_conflicting_results_rejected(self):
        event = bot.parse_match_line("Левски (София) - ЦСКА (София) 1:0", "2026-08-01", "19:00:00", "I кръг")
        with self.assertRaises(ValueError):
            bot.dedupe_events([event, {**event, "intHomeScore": "2"}])

    def test_failed_refresh_preserves_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "data.json"
            path.write_text('{"sentinel": true}')
            with patch.object(sys, "argv", ["bot", "--out", str(path)]), patch.object(bot, "fetch_pages", side_effect=RuntimeError("source unavailable")):
                self.assertEqual(bot.main(), 1)
            self.assertEqual(json.loads(path.read_text()), {"sentinel": True})

    def test_atomic_write_preserves_file_on_replace_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "data.json"
            path.write_text('{"sentinel": true}')
            with patch.object(bot.os, "replace", side_effect=OSError("disk failure")):
                with self.assertRaises(OSError):
                    bot.write_json({"new": True}, path)
            self.assertEqual(json.loads(path.read_text()), {"sentinel": True})
            self.assertEqual(len(list(Path(directory).iterdir())), 1)

    def test_europe_only_bulgarian_clubs_and_reset_leg_context(self):
        europe = bot.parse_europe(["Лига Европа", "Първи квалификационен кръг", "Реванш", "1 август 2026 г., 19:00 ч:",
            "ЦСКА (София) - Дери Сити (Ирландия) 3:0", "Шампионатна фаза", "I кръг", "1 септември 2026 г., 19:00 ч:",
            "Милан (Италия) - Рома (Италия) 2:1", "Левски (София) - Милан (Италия) 1:0"])
        self.assertEqual(len(europe["events"]), 2)
        self.assertEqual(europe["events"][-1]["roundLabel"], "I кръг")
        self.assertEqual({p["team"] for p in europe["participants"]}, {"ЦСКА", "Левски"})

    def test_one_digit_today_hour_keeps_team_name(self):
        page = bot.Page("today", "https://example.com", 'setDate", "2026-10-19"', ["Първа лига", "9:00 Левски (София) - ЦСКА (София) -"], "hash")
        events = bot.parse_today_matches(page)
        self.assertEqual(events[0]["strTime"], "09:00:00")
        self.assertEqual(events[0]["strHomeTeam"], "Левски")

    def test_invalid_table_is_rejected_and_optional_sources_are_stale(self):
        rows = [f"{rank}. Клуб {rank} 0 0 0 0 0:0 0" for rank in range(1, 11)]
        page = bot.Page("parva_liga", bot.PAGES["parva_liga"], "<h1>Първа лига 2026/27</h1>",
            ["Класиране:", *rows, "Бележки", "I кръг", "1 август 2026 г., 19:00 ч:", "Клуб 1 - Клуб 2 -"], "hash")
        previous = {"europe": {"events": [{"id": "saved"}]}, "pages": {"europe": {"checkedAt": "2026-08-01T00:00:00Z"}}}
        payload = bot.build_payload({"parva_liga": page}, previous)
        self.assertTrue(payload["pages"]["europe"]["stale"])
        self.assertEqual(payload["europe"]["events"][0]["id"], "saved")
        payload["table"][0]["intPlayed"] = 1
        with self.assertRaises(ValueError):
            bot.validate_payload(payload)
        payload["table"][0]["intPlayed"] = 0
        payload["table"][0]["intPoints"] = -3
        bot.validate_payload(payload)  # Administrative deductions remain valid.
        payload["events"] = []
        with self.assertRaises(ValueError):
            bot.validate_payload(payload)

    def test_source_consistency_reports_mismatch_without_altering_points_or_ranks(self):
        import copy
        rows = [dict(strTeam="Левски", intRank=2, intPlayed=1, intWin=1, intDraw=0, intLoss=0, intGoalsFor=2, intGoalsAgainst=0, intPoints=-1),
                dict(strTeam="ЦСКА", intRank=1, intPlayed=1, intWin=0, intDraw=0, intLoss=1, intGoalsFor=0, intGoalsAgainst=2, intPoints=4)]
        payload = {"table": rows, "events": [{"strHomeTeam": "Левски", "strAwayTeam": "ЦСКА", "intHomeScore": "2", "intAwayScore": "0", "status": "finished"}]}
        original = copy.deepcopy(payload)
        result = bot.inspect_source_consistency(payload)
        self.assertEqual(result["status"], "consistent")
        self.assertEqual(result["completedMatches"], 1)
        self.assertEqual(payload, original)
        payload["table"][0]["intGoalsFor"] = 3
        result = bot.inspect_source_consistency(payload)
        self.assertEqual(result["mismatches"][0]["differences"]["intGoalsFor"], {"published": 3, "fromResults": 2})
        self.assertEqual(payload["table"][0]["intPoints"], -1)
        self.assertEqual(payload["table"][0]["intRank"], 2)

    def test_season_transition_never_reuses_optional_sections(self):
        rows = [f"{rank}. Клуб {rank} 0 0 0 0 0:0 0" for rank in range(1, 11)]
        page = bot.Page("parva_liga", bot.PAGES["parva_liga"], "<h1>Първа лига 2027/28</h1>",
            ["Класиране:", *rows, "Бележки", "I кръг", "1 август 2027 г., 19:00 ч:", "Клуб 1 - Клуб 2 -"], "hash")
        previous = {"season": "2026-2027", "europe": {"events": [{"id": "old-season"}]},
                    "today": [{"id": "yesterday"}], "pages": {"europe": {"checkedAt": "2026-08-01T00:00:00Z"}}}
        payload = bot.build_payload({"parva_liga": page}, previous)
        self.assertEqual(payload["season"], "2027-2028")
        self.assertEqual(payload["europe"]["events"], [])
        self.assertEqual(payload["today"], [])
        self.assertNotIn("europe", payload["pages"])
        self.assertTrue(any("Няма запазени данни за този сезон" in warning for warning in payload["warnings"]))

    def test_empty_successful_europe_response_preserves_verified_section_and_time(self):
        rows = [f"{rank}. Клуб {rank} 0 0 0 0 0:0 0" for rank in range(1, 11)]
        page = bot.Page("parva_liga", bot.PAGES["parva_liga"], "<h1>Първа лига 2026/27</h1>",
            ["Класиране:", *rows, "Бележки", "I кръг", "1 август 2026 г., 19:00 ч:", "Клуб 1 - Клуб 2 -"], "hash")
        challenge = bot.Page("europe", bot.PAGES["europe"], "<h1>Please verify you are human</h1>", ["Please verify you are human"], "challenge-hash")
        previous = {"season": "2026-2027", "europe": {"participants": [{"team": "Клуб 1"}], "events": [{"id": "saved-match"}]},
                    "pages": {"europe": {"checkedAt": "2026-08-01T00:00:00Z", "sha256": "verified-hash"}}}
        payload = bot.build_payload({"parva_liga": page, "europe": challenge}, previous)
        self.assertEqual(payload["europe"], previous["europe"])
        self.assertEqual(payload["pages"]["europe"]["checkedAt"], "2026-08-01T00:00:00Z")
        self.assertEqual(payload["pages"]["europe"]["sha256"], "verified-hash")
        self.assertTrue(payload["pages"]["europe"]["stale"])
        self.assertEqual(payload["pages"]["europe"]["staleReason"], "empty-parse")
        self.assertTrue(any("не можаха да бъдат разчетени" in warning for warning in payload["warnings"]))
        # The same response on a new season must never restore old fixtures.
        previous["season"] = "2025-2026"
        payload = bot.build_payload({"parva_liga": page, "europe": challenge}, previous)
        self.assertEqual(payload["europe"]["events"], [])

    def test_script_content_does_not_become_source_data(self):
        self.assertEqual(bot.html_to_lines('<script>fake team 9:0</script><p>Левски</p>'), ["Левски"])


if __name__ == "__main__":
    unittest.main()
