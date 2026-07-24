# Архивни данни

`fetch-data.mjs` записва тук по един JSON файл за сезон:

```text
node fetch-data.mjs 2025-2026
node fetch-data.mjs 2024-2025
```

За голмайсторска таблица от всички налични timeline записи задайте `FULL_SCORERS=1`. Скриптът изчаква между заявките, за да спазва ограничението на безплатния API.

## Bulgarian-football bot

`scripts/bulgarian_football_bot.py` обновява `data/bulgarian-football.json` от:

- `https://bulgarian-football.com/parva-liga.html`
- `https://bulgarian-football.com/evroturniri.html`
- `https://bulgarian-football.com/machovete-dnes.html`

Локално:

```text
python scripts/bulgarian_football_bot.py --no-db
```

В GitHub Actions bot-ът се пуска на всеки 5 минути и commit-ва JSON файла само ако има промяна. Ако е зададен repository secret `DATABASE_URL`, същият bot записва snapshots и в PostgreSQL по schema от `scripts/schema.sql`.
