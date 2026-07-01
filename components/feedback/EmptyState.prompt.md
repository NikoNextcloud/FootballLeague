Single muted line of copy — the app's only empty/loading/error affordance. No spinners, no illustrations.

```jsx
{loading && <EmptyState>Зареждане на данни…</EmptyState>}
{error && <EmptyState>Данните все още не са налични. Стартирай fetch-data workflow-а.</EmptyState>}
```

Always plain, calm, and short — one sentence. Never uses red/danger color even for errors (the product treats "no data yet" as routine, not alarming).
