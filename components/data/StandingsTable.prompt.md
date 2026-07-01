Full league standings table with colored left-edge zone indicators (gold = champion, blue = Europe/title playoff, red = relegation playoff) and a legend row.

```jsx
<StandingsTable rows={data.table} />
<StandingsTable rows={data.table.slice(0, 8)} compact />
```

`compact` drops W/D/L, GF:GA and Form for a denser homepage preview. Positive goal difference renders green, negative renders red. Rank 1 gets the gold zone stripe; ranks 2–6 get blue; the bottom row gets red — this exact banding comes from the source app, don't recompute zone counts per league size.
