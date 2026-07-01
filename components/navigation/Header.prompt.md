Sticky top bar: brand mark + wordmark on the left, desktop nav links (hidden under 720px — BottomNav takes over on mobile), optional notify slot on the right.

```jsx
<Header activePath={path} onNavigate={setPath} logoSrc="logo-square.png" notifySlot={<IconButton>🔕</IconButton>} />
```

The six nav items (Начало, Класиране, Мачове, Голмайстори, Отбори, Архив) are fixed product nav, not a generic menu. Active link gets a 2px green underline.
