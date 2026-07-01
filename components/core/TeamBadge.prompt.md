Square team crest with automatic initials fallback if the image 404s.

```jsx
<TeamBadge src={team.strBadge} name={team.strTeam} size={26} />
```

Variants: no `src` (or a broken URL) renders a rounded initials chip instead of an image — always pass `name` even when you don't have art yet. Common sizes: 22 (table rows), 26 (match card), 48 (team grid card), 64 (team detail header).
