# Citydoku

Daily geography grids: **Global**, **Canada (Canadoku)**, **USA** and **Airports (Airportdoku)**. English, French and Spanish (Canada: English and French). One web app (Vite) that also ships as an iOS app (Capacitor). Accounts, leaderboards, friend leagues and feedback use Supabase.

```
src/
  main.js              boots auth, the store shim, the game, then the Quality Lab modules
  game.js              the game (editions, grids, clues, rarity, archive, leagues, map, sharing)
  style.css
  data/                ca.json us.json global.json airports.json (city/airport datasets), land.txt (map outline)
  platform/backend.js  Supabase store (players, feedback, realtime)
  platform/auth.js     Sign in with Apple / Google / email link (Facebook is built but hidden), sign out, delete account
  platform/native.js   iOS: share sheet, daily local notification, in-app browser
  platform/kofi.js     optional Ko-fi link (see KO-FI-SETUP.md)
  quality/             engine (preflight, scoring, snapshots), sync (offline queue), features (tutorial, passport, backup), qa (dev sweep), fixtures/golden.json
public/                icons, manifest, og.png, privacy.html, sw.js (offline service worker)
supabase/              schema.sql, migrations/ (apply in order after schema.sql)
scripts/               qa.mjs, smoke.mjs, e2e.mjs (browser checks), airportdoku/build-game-data.mjs
tests/                 engine unit tests
data/airportdoku/      research overlay (passengers, civil status, served continents) used to build airports.json
capacitor.config.json  iOS app id: app.citydoku.game
```

Without Supabase keys the game still runs: everyone plays as a guest and progress stays on the device.

---

## Checks

```bash
npm test                       # unit tests
npm run build && npx vite preview --port 4173 &
npm run qa                     # puzzle sweep + golden fixtures
npm run smoke                  # browser smoke test
node scripts/e2e.mjs           # full play-through of every edition, desktop and mobile
```

`qa`, `smoke` and `e2e` use Playwright (`npm i -D playwright && npx playwright install chromium`).

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # fill in after step 2
npm run dev                    # http://localhost:5173
```

## 2. Supabase (accounts and leaderboards)

1. Create a project at supabase.com (this project’s data is hosted in US East (Virginia); if you pick another region, update `public/privacy.html`).
2. **SQL Editor** → paste `supabase/schema.sql` → **Run**, then run each file in `supabase/migrations/` in date order.
3. **Project Settings → API**: copy the Project URL and the `anon` public key into `.env.local`.
4. **Authentication → URL Configuration**
   - Site URL: your website address (e.g. `https://citydoku.app`)
   - Redirect URLs: add `https://citydoku.app`, `http://localhost:5173` and `app.citydoku.game://auth`
5. **Authentication → Providers**
   - **Email**: on (magic links). Optionally set up custom SMTP so emails come from your domain.
   - **Google**: create an OAuth client in Google Cloud Console (type “Web application”), add the Supabase callback URL shown on the provider page, paste the client ID and secret.
   - **Apple**: in your Apple Developer account create a Services ID (e.g. `app.citydoku.web`) with “Sign in with Apple”, add the Supabase callback URL as a return URL, create a key, and paste the Services ID, Team ID, Key ID and private key into Supabase.

Feedback lands in the `feedback` table (Table Editor), readable only by you.

## 3. Website (Vercel, free tier)

1. Push this repo to GitHub.
2. vercel.com → **Add New Project** → import the repo. Framework: **Vite**. Build: `npm run build`, output `dist`.
3. Add the `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL` environment variables (and optionally `VITE_KOFI_URL`, see `KO-FI-SETUP.md`).
4. **Domains** → add your domain.

## 4. iOS app (Mac with Xcode)

```bash
npm install
npx cap add ios          # first time only
npm run ios              # builds the web app, copies it into Xcode, opens Xcode
```

In Xcode (`ios/App/App.xcworkspace`):

1. **Signing & Capabilities** → choose your team; bundle id `app.citydoku.game`.
2. Add capabilities: **Sign in with Apple** and **Push Notifications** (local notifications don’t need push, but keep it if you add push later).
3. **Info → URL Types** → add URL scheme `app.citydoku.game` (used to return from Apple/Google/email sign-in).
4. Replace the app icon with `public/icon-1024.png` (Assets → AppIcon).
5. Run on a device, then **Product → Archive → Distribute → App Store Connect**.

After every change to the web code: `npm run ios` again (or `npm run build && npx cap sync ios`).

### App Store checklist

- App Store Connect → new app, name **Citydoku** (if the name is taken on the store, use e.g. “Citydoku: City Trivia”).
- Privacy policy URL: `https://YOUR-DOMAIN/privacy.html` (finish the draft first).
- App Privacy: Contact info (email), User content (game answers), Identifiers (user ID); linked to the user; not used for tracking.
- Account deletion is in the app (Delete account) — required by guideline 5.1.1(v).
- Sign in with Apple is offered alongside Google — required by guideline 4.8.
- Screenshots: 6.9" and 6.5" iPhone.

## 5. Data and yearly refresh

- Canada: Statistics Canada 2021 Census (table 98-10-0002-01), teams 2026–27.
- USA: Census SUB-IP-EST2025 and SUB-EST2025 (New England towns, NJ townships), teams 2026 / 2026–27.
- Global: GeoNames + Olympic, World Cup and busiest-airport additions.
- Airports: OurAirports and Wikidata (via the staging files on the `feature/airportdoku-v1` branch / PR #1) plus `data/airportdoku/research_2026-11-08.json` (passenger counts, civil/joint-use status, served continents from web research; mostly Wikipedia-sourced, not operator-verified). `node` build logic is in `scripts/airportdoku/build-game-data.mjs` (`buildAirports(rows, overlay)`, minimum 5 million passengers); output is `src/data/airports.json`.

Each spring, refresh populations; before each season, check team moves. Datasets are the JSON files in `src/data/`.

## Notes

- Leaderboards read the 1,000 most recently active players. Past that, move rarity and leaderboards to SQL views.
- Daily grids change at midnight Eastern. 2026-11-08 is “Mixed”; from 2026-11-09 the daily difficulty rotates easy, medium, hard.
- Never reorder or edit clue lists, weights or datasets of Global/Canada/USA without updating `src/quality/fixtures/golden.json`: those fingerprints pin published daily grids (`npm run qa` checks them).
- Name check: citydoku.com is announced for a different iOS game called CityDoku. Search USPTO, CIPO and the App Store before submitting.
