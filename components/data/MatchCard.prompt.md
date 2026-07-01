Glass card for a single fixture — date/round meta row, two team names with badges, score or an em-dash for unplayed matches, optional venue line.

```jsx
<MatchCard event={{ strHomeTeam: "Левски", strAwayTeam: "ЦСКА", intHomeScore: "2", intAwayScore: "1", dateEvent: "2026-05-10", intRound: "30" }} />
```

Sits in a responsive `match-grid` (1 col mobile, 2 col ≥640px) alongside other MatchCards. Shows a green "На живо" badge when `strStatus` indicates an in-progress match.
