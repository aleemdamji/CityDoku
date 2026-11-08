# Airportdoku v1

This feature branch adds Airportdoku to the Citydoku edition picker and wires an airport-specific
category engine into the current 3x3 game (daily/archive/free, search by IATA code or name,
rarity and world map). **Airportdoku remains in Coming Soon mode until the audited
airport dataset is complete.** No new data is represented as verified yet.

## Decisions

* Worldwide medium/large airports with actual scheduled commercial passenger service.
* Temporarily suspended airports excluded.
* Each airport has a unique IATA code and stable OurAirports ID.
* Island and national-capital-service clues included after review.
* Passenger clues at 5M/10M/25M/50M, based on **2025 actual totals**.
* Non-stop scheduled passenger service to 5+ continents, excluding Antarctica, based
  on verified service in the agreed November 2026 route snapshot/window.
* IATA codes and airport names both accepted; separate airports serving the same city
  are separate answers.
* Existing Citydoku editions must retain their rules and saved scores.

## Current candidate snapshot (not production-ready)

`airports_candidates.json` contains **3,269 large/medium scheduled-IATA candidates**
from a public-domain OurAirports-derived 2026-07-19 source snapshot
(`gateway/flight-scout`, commit blob SHA recorded in `candidate_validation.json`),
enriched with country-to-continent mapping from OurAirports and coordinates
matched by IATA code from a separate public airport-coordinate dataset.

**Initial integrity checks:** 3,269 distinct IATA codes, 0 duplicates, 3,017
coordinate matches, 252 unmatched coordinates, and no missing mapped continents.
The files are deliberately separate from the *playable* `src/data/airports.json`,
which remains empty, with release approval disabled.

Important limitations:
* A source scheduled-service flag is not proof of active November 2026
  passenger operations. All 3,269 records require eligibility review.
* Coordinate matches by IATA are provisional until checked against primary
  airport locations; 252 records have no coordinate match.
* No 2025 passenger counts, runway classifications, island/capital flags,
  or five-continent scheduled-route audits have yet been verified.
* `airports_candidates.json` does not replace primary OurAirports raw CSV
  files required by `build.py`. Its records are research/staging data only.
* An airport's size category from this snapshot is provisional; the
  1,152 large-airport candidates should be audited against current definitions.

From `citydoku-app/`, run the offline candidate integrity checker:

```sh
node scripts/airportdoku/validate-candidates.mjs
```

This checks staging integrity; **it cannot certify the airports for gameplay**.

## November 8, 2026 staging audit (cross-referenced)

**Current best candidate baseline:** `staging/{africa,asia,europe,north-america,oceania,south-america}.json`
contains 3,244 medium/large candidate airports from the October 13, 2026
AirportMiles snapshot (CC0; OurAirports + Wikidata). These are NOT yet
approved game answers. See `validation_2026-10.json` for a reproducible
source manifest and detailed review queues.

Audit results:
* 3,244 unique IATA codes and internal IDs; 233 countries/territories; all
  coordinates and country-to-continent mappings present.
* 3,207 elevations present; 37 missing.
* 2,951 served cities present; 293 missing.
* 3,239 ICAO identifiers present; 5 missing.
* 31 coordinate disagreements >50 km against an older secondary dataset.
* 39 previously included airport codes absent from the newer list; 14 newly
  included; 7 size-class changes. These are review flags, NOT a confirmation
  that all 39 permanently closed or that all 14 began service.
* 20 ACI final-2025 passenger totals recorded, all matching staging IATA codes.
* Two primary-operator records confirmed: DJT's Aug 2026 IATA reassignment
  from PBI, and DXN's June 2026 commercial-service opening (see
  `operating_evidence.csv`).
* 218 capital-airport review candidates derived by joining the existing
  Citydoku Global capitals dataset against served-city names.
* 512 likely island-airport review candidates based on island countries and
  territories; individual airport locations are not yet approved.
* 12 possible direct routes at DXB/LHR are in `routes.csv` but their full
  retrospective schedule-window evidence is **unverified**. They are deliberately
  ignored by the production data builder.

Do not set `airports-release.json.approved=true` until real passenger,
route, runway, operational, island and capital data have been reviewed and
the full playable dataset passes acceptance checks. A false classification
can reject a correct answer; do not silently infer false from missing data.

### CI

`.github/workflows/airportdoku-validation.yml` runs:
`node scripts/airportdoku/validate-staging.mjs`,
`node scripts/airportdoku/validate-candidates.mjs`, and `npm run build`.
The staging checker also creates 100 simulated mixed grids using only the
known geography and IATA clue subset and checks nine distinct answers.
Those simulations **do not verify** the full Airportdoku generator against
the proposed passenger/runway/capital/island/route clue set.

## Prepare data

Download and pin a dated [OurAirports](https://ourairports.com/data/) snapshot into
`data/airportdoku/sources/` (airports.csv, runways.csv, countries.csv).
Do not commit source dumps without checking licenses and repository-size implications.
The script records SHA-256 hashes for reproducibility.

Populate:
* `manual_review.csv`: airport operating status, island and capital classification,
  route coverage validation, evidence URL and verification date.
* `passengers_2025.csv`: operator or authority sourced annual actuals, evidence and date.
* `routes.csv`: verified scheduled passenger routes with destination airport ID,
  operation in the reference window, evidence and date.
* `overrides.csv`: explicitly excluded records with reasons, and supporting evidence.

From `citydoku-app/` run:

```sh
python3 scripts/airportdoku/build.py
```

The script writes `data/airportdoku/validation_report.json`. It **refuses to
produce a release dataset when unresolved candidate airports remain**.
Use `--allow-partial` for exploratory datasets only (never deploy these).

The game-ready output is `src/data/airports.json`. It starts as `[]` so the
edition is visible but not playable. For deployment, supply an independently audited
dataset with at least 100 entries and every required field validated; the game's
readiness check is a *minimal safety gate*, not a substitute for the data audit.

## Verification checklist

1. Validate every inclusion/exclusion decision with sources.
2. Reject duplicate IATA codes and ambiguous airport identities.
3. Verify active commercial passenger service and explicitly exclude suspensions.
4. Verify island and capital flags; missing must never equal false.
5. Verify physical active runway count and longest runway.
6. Verify 2025 passenger thresholds with sufficient positive and negative coverage.
7. Verify all five-continent positives and complete route coverage for negatives.
8. Confirm no airport data was silently guessed or manufactured.
9. Test deterministic daily seeds and nine-distinct-answer feasibility over many dates.
10. Confirm separate edition leaderboards, archives, local saves and guest play.
11. Run `npm run build` and browser tests against a populated, reviewed fixture.
12. Merge only after source review and gameplay QA.

No claim of passenger or route coverage is made by the checked-in empty data files.
