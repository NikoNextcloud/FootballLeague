# А Група

Фен сайт за efbet Лига (А група) — класиране, мачове, резултати, голмайстори, отбори и архив от сезони, с автоматично обновяващи се данни и push известия. React + TypeScript + Vite, тъмна тема, mobile-first / PWA.

Данните идват безплатно от [TheSportsDB](https://www.thesportsdb.com/) (лига ID `4626`).

## Функционалности

- **Начало** — класиране (топ 8), предстоящи мачове, последни резултати, топ 5 голмайстори, "обновено преди X мин"
- **Класиране** — пълна таблица (И/П/Р/З/ГР/+-/Т, форма), цветни зони (шампион / Европа / плейоф за оставане)
- **Мачове** — филтри Всички / Предстоящи / Резултати + филтър по отбор
- **Голмайстори** — класация, изчислена автоматично от изиграните мачове (виж бележката по-долу)
- **Отбори** — грид с всички отбори + детайлна страница (герб, стадион, статистика, история на мачовете)
- **Архив** — класирания и мачове от предходни сезони (селектор по сезон)
- **Push известия** — за начало на мач и голове, чрез OneSignal (безплатно)
- Лого на лигата навсякъде + PWA (може да се "инсталира" на телефона от браузъра)
- Мобилна долна навигация + десктоп горно меню, изцяло responsive
- Всичко се обновява автоматично чрез GitHub Actions — без ръчна намеса

## Локална разработка

```bash
npm install
npm run fetch-data      # изтегля свежи данни в public/data/league.json
npm run fetch-scorers   # изчислява голмайсторите (по желание)
npm run fetch-archive   # изтегля архив от предходни сезони (по желание)
npm run dev
```

## Деплой в GitHub (стъпка по стъпка)

1. Създай нов празен repo в GitHub, напр. `a-grupa`.
2. Качи проекта:
   ```bash
   git init
   git add .
   git commit -m "Първоначален commit"
   git branch -M main
   git remote add origin https://github.com/<user>/a-grupa.git
   git push -u origin main
   ```
3. В repo-то → **Settings → Pages** → Source: **GitHub Actions**.
4. В repo-то → **Settings → Actions → General → Workflow permissions** → избери **Read and write permissions** (нужно е за автоматичните commit-и на данни).
5. При първия push `deploy.yml` ще построи и качи сайта. След няколко минути е достъпен на `https://<user>.github.io/a-grupa/`.
6. `update-data.yml` тръгва по разписание (на всеки 20 мин) и при push към `main`. Може да го пуснеш и ръчно от **Actions → Update league data → Run workflow**.
7. За архива: **Actions → Update archive (previous seasons) → Run workflow** (пуска се веднъж, после — автоматично веднъж месечно).

### По желание: по-точни данни (Premium API ключ)

Безплатният ключ (`3`) е споделен и ограничен — особено за timeline данните на голмайсторите. За по-надеждни резултати:

1. Стани Patreon поддръжник на TheSportsDB (~9€/мес, виж thesportsdb.com/pricing) и вземи личен ключ.
2. **Settings → Secrets and variables → Actions** → добави secret `THESPORTSDB_API_KEY`.

### Push известия (OneSignal — безплатно, не изисква собствен сървър)

1. Направи безплатен акаунт в [onesignal.com](https://onesignal.com) → нов "Web Push" app → въведи адреса на сайта (`https://<user>.github.io/a-grupa/`).
2. От **Settings → Keys & IDs** вземи **OneSignal App ID** и **REST API Key**.
3. В GitHub repo-то → **Settings → Secrets and variables → Actions** → добави:
   - `ONESIGNAL_APP_ID` (използва се и от `update-data.yml`, и подава се към билда за клиентския SDK)
   - `ONESIGNAL_REST_API_KEY` (само за пращане на известия от Actions — пази го в тайна)
4. Push-ни отново или пусни `deploy.yml` ръчно — сега камбанката 🔕/🔔 горе вдясно ще се появи и потребителите ще могат да се абонират.
5. При всяко обновяване на данните (`update-data.yml`), `notify.mjs` сравнява старото и новото състояние и праща известие при начало на мач или гол — без нужда от собствен сървър, само чрез OneSignal REST API.

> Без тези secrets сайтът работи напълно нормално — просто бутонът за известия не се показва.

## Голмайстори — важна бележка

TheSportsDB няма отделен безплатен endpoint за голмайстори. Класацията се изгражда сама, като `fetch-scorers.mjs` чете timeline-а (`lookuptimeline.php`) на всеки изигран мач и брои головете. **Безплатният ключ връща само частичен timeline на мача** (не всички събития), затова класацията е ориентировъчна, не 100% точна — с Premium ключ е по-пълна. Скриптът обработва мачовете постепенно (до 20 нови на пускане) и кешира резултата, за да не хаби заявки.

## Структура

```
scripts/fetch-data.mjs      # текущ сезон → public/data/league.json
scripts/fetch-scorers.mjs   # голмайстори → public/data/scorers.json (+ кеш)
scripts/fetch-archive.mjs   # предходни сезони → public/data/archive/*.json
scripts/notify.mjs          # push известия при промяна (OneSignal)
public/data/                # всички данни, четени от сайта
src/pages/                  # Начало, Класиране, Мачове, Голмайстори, Отбори, Детайли, Архив
src/components/             # StandingsTable, MatchCard, TeamBadge, Nav, NotifyButton
.github/workflows/
  update-data.yml           # fetch + известия + голмайстори, на 20 мин
  update-archive.yml        # архив, веднъж месечно / ръчно
  deploy.yml                # build + GitHub Pages
```

## Бъдещи идеи за разширение

- Още по-пълна статистика при преминаване към Premium API план
- Известия само за любим отбор (изисква per-user тагове в OneSignal)
