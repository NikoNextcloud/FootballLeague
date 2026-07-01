Glass tile for the Teams grid (2 cols mobile → 4 cols desktop) — crest above, name below, links to the team detail page.

```jsx
<TeamCard name="Левски" badgeSrc={team.strBadge} onClick={() => navigate(`/otbori/${team.idTeam}`)} />
```

Border brightens slightly on hover (`rgba(255,255,255,0.18)`) — no scale/shadow change.
