# Данни

## Bulgarian-football bot

`scripts/bulgarian_football_bot.py` обновява `data/bulgarian-football.json` от:

- `https://bulgarian-football.com/parva-liga.html`
- `https://bulgarian-football.com/evroturniri.html`
- `https://bulgarian-football.com/machovete-dnes.html`

Локално:

```text
python scripts/bulgarian_football_bot.py
```

В GitHub Actions bot-ът се пуска на всеки 5 минути и commit-ва JSON файла само ако има промяна.
