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
