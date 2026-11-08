# Citydoku

Daily city trivia grids: **Global**, **Canada (Canadoku)** and **USA**, in English, French and Spanish. One web app (Vite) that also ships as an iOS app (Capacitor). Accounts, leaderboards, friend leagues and feedback use Supabase.

```
src/
  main.js              boots auth, the store shim and the game
  game.js              the game (grids, categories, rarity, archive, leagues, map, sharing)
  style.css
  data/ca.json us.json global.json land.txt   city datasets + world map outline
  platform/backend.js  Supabase store (players, feedback, realtime)
  platform/auth.js     Sign in with Apple / Google / email link, sign out, delete account
  platform/native.js   iOS: share sheet, daily local notification, in-app browser
public/                icons, manifest, og.png, privacy.html (draft)
supabase/schema.sql    tables, row-level security, account deletion
capacitor.config.json  iOS app id: app.citydoku.game
```

Without Supabase keys the game still runs: everyone plays as a guest and progress stays on the device.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # fill in after step 2
npm run dev                    # http://localhost:5173
```

## 2. Supabase (accounts and leaderboards)

1. Create a project at supabase.com (pick a region near your players, e.g. `ca-central-1`).
2. **SQL Editor** → paste `supabase/schema.sql` → **Run**.
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
3. Add the three `VITE_…` environment variables.
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

Each spring, refresh populations; before each season, check team moves. Datasets are the JSON files in `src/data/`.

## Notes

- Leaderboards read the 1,000 most recently active players. Past that, move rarity and leaderboards to SQL views.
- Daily grids change at midnight Eastern. From 2026-11-08 the daily grid is “Mixed” difficulty.
- Name check: citydoku.com is announced for a different iOS game called CityDoku. Search USPTO, CIPO and the App Store before submitting.
