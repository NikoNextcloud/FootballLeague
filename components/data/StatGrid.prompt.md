Grid of glass stat tiles used on a team's detail page (place, points, played, wins, draws, losses).

```jsx
<StatGrid stats={[
  { value: row.intRank, label: "място" },
  { value: row.intPoints, label: "точки" },
  { value: row.intPlayed, label: "мачове" },
]} />
```

3 columns on mobile, 6 on desktop (≥640px) — pass exactly as many stats as fit that grid.
