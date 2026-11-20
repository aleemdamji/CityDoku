# CityDoku Offline Quality Lab

An **offline, zero-dependency prototype** of CityDoku puzzle-quality tools and gameplay enhancements. It does **not** change the CityDoku production repository, Vercel, Supabase, daily puzzles, or existing accounts.

## Run

1. Unzip this folder.
2. Double-click `index.html`. Standard modern browsers can load it using `file://` without a server.
3. Use the tabs: **Puzzle scoring**, **Interactive tutorial**, **Discovery**, **Automated checks**.
4. Optionally select a local CityDoku JSON dataset from the dataset import field. Data stays in memory; no uploads.
5. Click **Export JSON report** to save findings.

Run CLI automated tests with Node.js 18+:

```sh
cd citydoku-offline-quality
node --test tests/core.test.js
```

## What is implemented

- **Puzzle quality:** Deterministic seeded candidate sampling; 3x3 valid-answer counts; score out of 100; repeat-clue, sparse/empty cell, clue-family diversity, answer pool, imbalance and overly broad cell penalties; explicit pass/fail quality gate. Score weights are *starting hypotheses* and should be calibrated with actual CityDoku player data.
- **Tutorial:** Three steps (understand row/column intersection, enter a practice answer, celebrate). Uses exact match and accent normalization. Demo-only, no real game save.
- **Discovery:** Ranked alternative valid cities for selected puzzle intersections, with curated facts where available. In a production integration, surface it **only after completion/give-up** and use proven factual metadata, not unsupported generated claims.
- **Checks:** Record identity duplicates, empty/invalid clue definitions, ambiguous city names, zero-answer clue pairs, sampled puzzle pass rates, JSON report export and Node regression tests.

## Important limitations

- The built-in 52-city sample is **illustrative**, not a replacement for the 743/421/880 production city datasets. Attributes are simplified, and some geographic classifications depend on adopted definitions.
- Imported CityDoku files may have fields or production predicates that do not match this example's generic clue schema. In that case use a wrapper `{ "cities": [...], "clues": [...] }` with predicates described below, or adapt your game's real clue engine to this core. A bare JSON array uses demo clues by default; clue stats might therefore be sparse.
- The heuristic candidate generator independently samples six clues from the same candidate pool; the production game may use **edition-specific clue pools, exclusions, historical seeds and rarity logic**. Integrate as an *offline review pipeline*, **not** a change to the existing deterministic daily generator until proven compatible.
- This release has no production database connection, analytics or live statistics. The demo discovery deliberately reveals puzzle alternatives because it's a **post-game preview**.
- A real CityDoku merge should add unit/integration tests for each edition, daily seed freeze, 3x3 completion behavior, mobile keyboard interaction, full localization, accessibility and data-version provenance.

## JSON input format

```json
{
  "cities": [
    {"name":"Paris", "country":"France", "continent":"Europe", "capital":true,
     "population":2100000, "aliases":["París"], "fact":"Paris stands on the Seine."}
  ],
  "clues": [
    {"id":"capital", "label":"A capital city", "field":"capital", "op":"flag", "family":"political"},
    {"id":"europe", "label":"In Europe", "field":"continent", "op":"eq", "value":"Europe", "family":"continent"}
  ]
}
```

Supported operations: `eq` (normalized string equality), `flag` (true/yes/1), `has` (token membership of array or `;`, `,`, `|` separated field), `gte` and `lt` (numeric comparison). **Only locally-authored JSON data; no dynamic code execution.**

## Integration boundaries

This prototype is intentionally separate from the production application. Any production integration requires edition-specific adapters, historical-seed preservation, local-data migration handling, and browser regression testing. No production game files are changed by this package.

## Suggested production acceptance gates

- No invalid IDs, duplicate identities, or unreviewed ambiguous submitted answers.
- No daily puzzle cells with zero answers under the approved dataset.
- No accidental clue repetitions; vetted difficulty mix; acceptable spread and coverage.
- A deterministic golden-seed test for all edition/date combinations, including historical dates.
- Tutorial works on keyboard/touch and never affects actual streaks/scores.
- Discovery facts have attributable data sources; no spoilers before game completion or forfeiture.
- Existing editions pass mobile, localization and backend regression tests.

No third-party fonts, scripts, tracking, network requests or build tools are required.

## Version 2 additions (2026-11-08)

The expanded section beneath the original four modules includes:

1. **Smart difficulty calibration:** A separate 0–100 estimate combines valid-answer availability and a population-derived recognizability proxy. It explicitly labels impossible squares. This is a heuristic; actual recognizability will need play data.
2. **Private personal geography statistics:** The Passport counts unique places, countries, continents, games, best recorded rarity and longest run of consecutively dated completed games. Demo saves only; no CityDoku account data.
3. **Daily puzzle preflight:** Checks all nine intersections, one-answer warnings, repeated clue IDs and missing labels for supplied language dictionaries. Export manually selected puzzle definitions.
4. **Disambiguated answer suggestions:** Partial, accent-insensitive name and alias search; same-named places retain distinct IDs/locations. Select a puzzle cell to try an answer; validation still checks both clues and rejects repeated answers.
5. **Transparent rarity:** Interactive formula `(picks + 5 × estimated_probability) / (players + 5)` distinguishes observed percent, estimated prior and approximate sample confidence.
7. **Progress tracking:** Private historical game count, completed grids, best rarity and longest streak.
8. **Offline resilience:** Fully static files; localStorage stores sample-game progress, puzzle draft and historical snapshots. Downloadable JSON profile backups; restoration works without network. **No cloud-sync queue is implemented**, because this offline proof of concept has no backend.
9. **Achievements:** Unlocks six example milestones derived from locally recorded games; no account or leaderboards.
11. **Private puzzle editor:** Choose row/column clues, inspect difficulty and quality, load a solvable candidate, fill a demonstrative valid solution, export puzzle definition and freeze eligible-answer snapshots.
12. **Historical regression checks:** Freeze every eligible answer ID for nine intersections; compare against whichever dataset is currently loaded and report added/removed answer IDs or missing clues. Export/import snapshots for later offline checks.
13. **Geography Passport:** Local lists of visited countries and continents, unique cities and region badge visualizations; provides a simple, accessible alternative to a map. A production geographic map requires vetted geometry/geocoding sources.

### Running all automated tests

```sh
node --test tests/*.test.js
```

### Suggested walkthrough

1. In **Puzzle editor & preflight**, click **Load best demo puzzle**.
2. Use **Fill valid demo answers** to populate a legitimate nine-city example (or choose answers individually via **Answer search & rarity**).
3. In **Answer search & rarity**, click **Save completed game to passport**.
4. Open **Passport & achievements** to see the progress, and export a backup.
5. In the editor, click **Freeze snapshot**, then inspect **Historical regression**. Import a modified dataset to see whether any answers were added/removed.

### Storage and limitations

Data stays locally in your browser. `file://` sessions differ between browsers and can be cleared; use JSON backups to preserve any sample progress. Backups are *local prototype exports*, not compatible with Supabase production player records. Source identifiers and country/continent facts are only as accurate as the imported dataset. The example achievement, estimated difficulty and score values should be calibrated and verified before integrating into live CityDoku. There is no networking, background service worker, packaged native app or automatic syncing.