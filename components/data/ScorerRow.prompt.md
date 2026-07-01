Single row for the top-scorers list — rank, crest, player name, goal count in accent green.

```jsx
{scorers.list.map((s, i) => (
  <ScorerRow key={s.player} rank={i + 1} player={s.player} team={s.team} teamBadge={s.teamBadge} goals={s.goals} />
))}
```

Stack rows in a `flex-direction: column` list with a 6px gap. Goal count is always the visual endpoint — keep it right-aligned and bold.
