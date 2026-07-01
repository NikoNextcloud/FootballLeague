# UI Kit — А Група fan app

Interactive click-through recreation of the single product surface: a mobile-first PWA for following efbet Лига (Bulgarian top-flight football).

## Screens
- **Home (Начало)** — compact top-8 standings, next 4 fixtures, last 4 results, top-5 scorers
- **Standings (Класиране)** — full table with zone highlighting
- **Matches (Мачове)** — filter chips (Всички/Предстоящи/Резултати) + team dropdown
- **Teams (Отбори)** — crest grid → click through to a team detail page (stats, description, match history)
- **Scorers (Голмайстори)** — full goalscorer ranking table + accuracy disclaimer
- **Archive (Архив)** — season picker over the same standings/match components (mocked to reuse the current season's data for this demo)

## Data
`mockData.js` stands in for the real `public/data/*.json` produced by the source repo's GitHub Actions fetch scripts — same shapes (`TableRow`, `EventItem`, `TeamItem`, `ScorerEntry`), plausible values.

## Notes
- Routing is a simple in-memory state switch (not `react-router-dom`'s `HashRouter`, to keep this a dependency-free static demo) — `Header`/`BottomNav`'s `onNavigate` wires straight into it.
- All screens compose the design system's `components/` — no bespoke UI was built for this kit beyond page-level layout glue.
