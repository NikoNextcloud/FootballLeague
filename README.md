# А Група — Design System

Design system for **А Група** (*A Grupa*), a Bulgarian-language fan website for **efbet Лига** — the top division of Bulgarian football (known as "А Група"). The site is a free, community-run companion app: live standings, fixtures/results, a computed goalscorer ranking, club pages, a season archive, and opt-in push notifications. It is not an official league product — it's a fan project built on public data.

- **Product**: a single surface — a mobile-first Progressive Web App (installable, works offline-ish via caching), with a responsive desktop layout that reveals a top nav bar in place of the mobile bottom tab bar.
- **Stack**: React 19 + TypeScript + Vite, `react-router-dom` (HashRouter), plain CSS (no Tailwind/CSS-in-JS). Data is static JSON regenerated every 20 minutes by GitHub Actions from [TheSportsDB](https://www.thesportsdb.com/) (league ID `4626`), no backend server.
- **Audience**: Bulgarian football fans following the domestic top flight — casual, mobile-first checking of scores/standings, not a professional sports-data terminal.

## Sources

This design system was built by reading the actual product codebase, mounted read-only at `a-grupa/` during authoring (not included in this project's shipped files). Key paths referenced:
- `a-grupa/src/index.css` — the entire token system (colors, radius, spacing) and page-level layout rules
- `a-grupa/src/components/*.tsx` — `MatchCard`, `Nav` (Header/BottomNav), `NotifyButton`, `StandingsTable`, `TeamBadge`
- `a-grupa/src/pages/*.tsx` — `Home`, `Standings`, `Matches`, `Scorers`, `Teams`, `TeamDetail`, `Archive`
- `a-grupa/src/types.ts` — data shapes (`TableRow`, `EventItem`, `TeamItem`, `ScorerEntry`)
- `a-grupa/README.md` — product description, functionality list, deployment notes
- `a-grupa/public/*` — logos, favicons, PWA icons, manifest
- `a-grupa/ОТБОРИ/*` — the 14 club crest images used across the league table, match cards, and team grid

No Figma file or slide deck was provided for this project.

## Index

- `index.html` — redirects to the standalone app demo (works both on GitHub Pages and opened locally via file://)
- `ui_kits/a-grupa/index.standalone.html` — fully self-contained bundle of the app demo (all CSS/JS/fonts inlined) — open this directly by double-click if the linked/relative-path version doesn't render locally
- `ui_kits/a-grupa/index.html` — source version of the app demo (relative paths — needs a real server or GitHub Pages, not a plain file:// double-click, to resolve `_ds_bundle.js` reliably in all browsers)
- `styles.css` — root stylesheet entry point (imports only)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css` (self-hosted Inter)
- `assets/` — `logos/` (league + PWA icons), `teams/` (14 club crests), `fonts/` (Inter woff2, latin+cyrillic)
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand groups) shown in the Design System tab
- `components/`
  - `core/` — `TeamBadge`, `Chip`/`ChipGroup`, `Select`, `IconButton`
  - `navigation/` — `Header`, `BottomNav`
  - `data/` — `StandingsTable`, `MatchCard`, `TeamCard`, `ScorerRow`, `StatGrid`
  - `feedback/` — `EmptyState`
- `ui_kits/a-grupa/` — interactive click-through recreation of the fan site (Home, Standings, Matches, Teams, Team Detail, Scorers, Archive)
- `SKILL.md` — portable skill definition for use in Claude Code / other agent contexts

## Content fundamentals

All copy is **Bulgarian**, written in a plain, direct, informational register — this is a stats utility, not a magazine. No headlines-as-copywriting, no calls to action beyond simple nav labels.

- **Voice**: neutral and factual — "Класиране" (Standings), "Мачове" (Matches), never "Виж твоите любими отбори!" style marketing enthusiasm. The one first-person-adjacent touch is the tagline "Фен сайт за efbet Лига" (Fan site for efbet League) — it openly frames itself as unofficial/fan-made.
- **Casing**: sentence case throughout — "Голмайстори", "Пълно класиране →", "Данните все още не са налични." Table headers use short uppercase abbreviations (И, П, Р, З, ГР, Т) because they're single/double-letter stat codes, not styled uppercase for emphasis.
- **You vs. we**: mostly impersonal/passive — "Класирането все още не е налично" (the standings aren't available yet), not "we couldn't load your standings." System status is described about the data, not about the user.
- **Emoji**: used functionally as navigation/status glyphs (🏠 📊 ⚽ 🥅 🛡️ 🗂️, 🔔/🔕), never decoratively inside sentences or headings.
- **Numbers over adjectives**: goal difference, points, and form strings (e.g. "ППРПЗ") speak for themselves — no "great run of form!" commentary.
- **Time phrasing**: relative and terse — "преди 12 мин", "преди 3 ч", "преди 2 дни", "току-що" (just now).
- **Disclaimers are honest, not defensive**: e.g. the scorer list note explains the free API key only returns partial match timelines, so the ranking is "ориентировъчна, не 100% точна" (indicative, not 100% accurate) — the product is upfront about data limitations rather than hiding them.
- **Empty/loading states are one calm sentence**, e.g. "Данните все още не са налични. Стартирай fetch-data workflow-а." — instructive when it's a setup issue, reassuring when it's just pending data ("Класацията се попълва постепенно" — the ranking fills in gradually).

## Visual foundations

**Overall vibe**: dark glassmorphism sports app — a near-black navy canvas with soft color-glow washes behind translucent "glass" cards. Calm and data-dense but airy, not corporate-dashboard-dense.

- **Colors**: base is `#0b0f16` (near-black navy) with a slightly-lighter elevated tone `#131a24`. One accent does double duty as brand + "positive/live" color: green `#22c55e`. Blue `#3b82f6` is reserved for links and the "Europe/title-playoff" table zone. Gold `#f5b942` marks the champion zone. Red `#ef4444` is relegation/negative-diff only — used sparingly, never as a general error color (empty states stay neutral gray even when something's technically wrong).
- **Type**: single family, Inter, at just five or six sizes (30/24/17/14/13/11px) with two weight extremes doing most of the work — 600/700 for labels and headings, and a punchy 800 ("black") reserved for numbers that matter (points, goals, scores). Letter-spacing is either slightly tight on the big hero heading (-0.5px) or slightly wide on uppercase micro-labels (+0.3–0.4px).
- **Spacing**: no rigid 4/8px grid — literal values pulled straight from the source (2, 4, 6, 8, 10, 12, 14, 16, 20, 26px). Content column caps at 960px, centered, with generous internal card padding relative to the tight information density.
- **Backgrounds**: solid near-black base, no imagery — depth comes entirely from two large soft radial gradients (blue top-left, green top-right) fading into the base color, plus translucent glass cards on top. No photography, no illustration, no repeating texture/pattern, no grain.
- **Cards**: the one recurring surface pattern — `background: rgba(255,255,255,0.045)`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 14px`, `backdrop-filter: blur(6px)`. No drop shadows anywhere in the system; all depth reads through blur + translucency instead.
- **Corner radii**: consistently rounded, never sharp — 6px (badges), 10px (chips/buttons), 12px (stat tiles), 14px (cards/tables), and full pill (999px) for filter chips.
- **Borders**: hairline only (`rgba(255,255,255,0.08)`), brightening slightly to `rgba(255,255,255,0.18)` on hover — borders are the primary hover affordance, not background-color shifts.
- **Shadows**: none used for elevation. The only "shadow" in the system is a semantic `inset 3px 0 0 <zone-color>` stripe on standings rows to mark champion/Europe/relegation zones — a functional indicator, not a decorative effect.
- **Hover states**: subtle border brighten (team cards) — no color inversion, no lift/scale.
- **Press/active states**: chips and nav links swap directly to solid states (active chip → solid green fill + dark text; active nav link → accent-green underline or tinted background) rather than any transform/scale feedback.
- **Animation**: essentially none — no transitions, fades, or easing curves are defined anywhere in the source stylesheet. This is a static, snappy, information-first UI; do not add motion unless asked.
- **Transparency & blur**: used constantly and deliberately — every card, the sticky header, and the fixed bottom nav are all translucent + blurred (`backdrop-filter: blur`) so content scrolls visibly underneath them. This is the system's single most defining visual trait.
- **Imagery / crest art**: the only imagery is official club crests (badges) sourced from TheSportsDB — full color, on-brand club heraldry, displayed small (22–64px) with a soft off-white/near-transparent chip behind them (`rgba(255,255,255,0.03)`) so dark-logo crests stay legible against the near-black background. No warm/cool grading or grain — crests are used as-is.
- **Layout rules**: sticky top header (desktop ≥720px) and a fixed bottom tab bar (mobile <720px) are mutually exclusive by breakpoint — never both visible. Content has bottom padding reserved so it never sits under the fixed bottom nav.

## Iconography

- **No icon font and no SVG icon set.** All navigation and status icons are plain **Unicode emoji**, rendered at the browser/OS's native emoji style (🏠 📊 ⚽ 🥅 🛡️ 🗂️ for the six main nav items, 🔔/🔕 for notification state, ← for back-links as a plain arrow glyph). This is a deliberate zero-dependency choice — no icon library, no custom glyphs to draw or maintain.
- **Club crests are the only "icon-like" imagery**, and they come from a third-party source (TheSportsDB) — copied into `assets/teams/` in this design system, never hand-drawn.
- **Fallback pattern**: when a crest fails to load, the `TeamBadge` component falls back to a rounded initials chip (e.g. "ЛЕВ") rather than a generic broken-image icon or a placeholder icon-font glyph.
- If you need additional icons beyond what emoji cover (e.g. a settings gear, a share icon), the closest zero-dependency match consistent with this product's minimal-tooling approach would be a small inline SVG set like **Lucide** — flag this as a substitution if you add it, since the source product doesn't use any SVG icon set today.

## Fonts

The source app declares `font-family: "Inter", system-ui, ...` in its CSS but does **not** ship a font file or a Google Fonts `<link>` — it silently relies on Inter being available as a system/cached font, falling back to `system-ui` otherwise. That's a gap, not a deliberate substitution: **Inter is the intended brand font**, just not actually self-hosted in the source repo.

This design system closes that gap by self-hosting real **Inter** (v20, weights 400/500/600/700/800, latin + cyrillic subsets — Cyrillic is required for the Bulgarian-language UI) as `.woff2` files under `assets/fonts/`, declared in `tokens/fonts.css`. No visual substitution was made — this is the exact typeface the product already names, just now actually delivered.

## Caveats & ask

- I could not access a Figma file or any design tool for this product — everything here comes from reading the live React/CSS source, which is unambiguous for tokens and component styling but means there's no explicit "design intent" doc beyond the code and README comments.
- The product has exactly one surface (the fan site) and no separate marketing site, so there's a single UI kit rather than multiple product surfaces.
- `hero.png` in `src/assets/` is an unused Vite template leftover (not real product imagery) — I did not copy it in, since it isn't part of the actual brand.
- **Please tell me if anything looks off** — especially the color/type token values (I copied literal numbers from `src/index.css`, but if the live site has since diverged, let me know) and whether the Inter self-hosting matches what you'd want, or if you'd rather keep relying on system fonts. I'd also love real Figma or additional brand assets (wordmark variations, social templates, etc.) if they exist, to round this out further.
