34×34 square icon button — the source app's only use is the push-notification bell in the header, toggling 🔕 / 🔔.

```jsx
<IconButton on={subscribed} disabled={!ready || subscribed} title="Включи известия" onClick={handleClick}>
  {subscribed ? "🔔" : "🔕"}
</IconButton>
```

`on` draws the green accent border to indicate an active/subscribed state; otherwise it's a plain glass square.
