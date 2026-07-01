Thin wrapper around the native `<select>` styled to match the glass card system — used for the team filter on the Matches page.

```jsx
<Select value={team} onChange={(e) => setTeam(e.target.value)}>
  <option value="all">Всички отбори</option>
  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
</Select>
```

Uses the platform-native dropdown UI (no custom popover) — intentionally minimal.
