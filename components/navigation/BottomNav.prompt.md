Fixed bottom tab bar shown only on mobile (hides at 720px+, where `Header`'s desktop nav takes over) — icon + label per tab, active tab tinted green.

```jsx
<BottomNav activePath={path} onNavigate={setPath} />
```

Always render alongside `Header`, never alone — they're two halves of the same nav pattern, swapped by breakpoint.
