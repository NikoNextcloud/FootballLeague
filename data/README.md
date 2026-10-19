# Данни

Активен файл: `bulgarian-football.json`, schema v2. Генерира се от `scripts/bulgarian_football_bot.py` на 15 минути чрез GitHub Actions. Приложението го проверява на 5 минути, докато е отворено.

`lastSuccessAt`/`updatedAt` са часът на успешната проверка от бота, не моментът на отваряне в браузъра. `pages` пази произход и отделен час на всяка секция. `integrity` сравнява статистиката на класирането с приключилите срещи; точки и позиции винаги са тези на източника.

Ключови полета на мач: `id` (стабилно при пренасрочване), `dateEvent`, `strTime` (празен при неизвестен час), `kickoffAt` (ISO с българския UTC offset, когато часът е известен), `intRound`, `status`, двата резултата или `null`.

```sh
python scripts/bulgarian_football_bot.py
python scripts/bulgarian_football_bot.py --validate-only
```

Източници: https://bulgarian-football.com/parva-liga.html, https://bulgarian-football.com/evroturniri.html, https://bulgarian-football.com/machovete-dnes.html.

`2026-2027.json` е наследен файл от друг източник и не участва в активното зареждане.
