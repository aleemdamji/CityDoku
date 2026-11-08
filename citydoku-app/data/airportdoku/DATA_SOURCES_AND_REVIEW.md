# Airportdoku — replacement datasets and manual review protocol
_Research verified 2026-11-08. This document does not approve any staging airport for gameplay._

## Data sources prioritized

| Gap | Dataset | Coverage and usage | License / caution |
|---|---|---|---|
| Runways, elevation, identity | [OurAirports](https://ourairports.com/data/), `airports.csv`, `runways.csv` | Worldwide, daily; join `runways.airport_ref` to `airports.id`; one runway per row, **not two ends**. Exclude `closed=1`, helicopters and waterways as appropriate. | Public domain, community maintained; verify questionable runway status. |
| 2025 passengers, Europe | [Eurostat avia_paoa](https://ec.europa.eu/eurostat/databrowser/product/view/AVIA_PAOA) | Reporting-airport passenger data, monthly/yearly; filter **2025 annual, total transport, total schedule, passengers carried**, verify transit definition. | Public statistics, verify reuse and proper citation; compare definition with other national figures. |
| 2025 passengers, USA | [FAA CY 2025 passenger boarding](https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger) and [BTS T-100](https://www.transtats.bts.gov/TableInfo.asp?gnoyr_VQ=FMF) | All U.S. commercial airports. FAA **enplanements are departures only**, not total airport throughput. BTS T-100 segment provides passenger volume, but deduplication and scope must be designed before merging. | Public government data; never label enplanements as total annual passengers. |
| 2025 passengers, UK | [UK CAA airport data](https://www.caa.co.uk/data-and-analysis/uk-aviation-market/airports/uk-airport-data/latest-quarterly-statistics/) | Airport-level passenger statistics and 2025 annual reporting. | Verify terminal-vs-total passenger definition. |
| 2025 passengers, Canada | [Statistics Canada airport activity 2025](https://www150.statcan.gc.ca/n1/daily-quotidien/260721/dq260721a-eng.htm) and [table 23-10-0253-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2310025301) | Airport activity and related tables; check airport-specific availability before ingestion. | Country headline total does not assign figures to individual airports. |
| 2025 passengers, Australia | [BITRE airport traffic data](https://www.bitre.gov.au/resource/aviation/airport-traffic-data) | Monthly and annual air traffic for selected Australian airports. | Coverage not universal; check regular-public-transport vs airport-total methodology. |
| Island geometry | [Natural Earth 1:10m land and minor islands](https://www.naturalearthdata.com/downloads/10m-physical-vectors/) | Point-in-polygon to identify island polygons, cross-check with mainland landmass; validate tiny offshore islands and reclaimed land. | Public domain; polygon resolution can miss small islands. |
| Capital service | Citydoku Global capitals + Wikidata served-city aliases | Match airport's served city to national capital; 218 matching candidates in `capital_candidates.csv`. | Capital city match alone is not final confirmation of passenger airport relationship. |
| 5+ continents | [OAG historical schedules](https://www.oag.com/airline-schedules-data) or [Aviation Edge routes/schedules](https://aviation-edge.com/) | Confirm operated nonstop scheduled passenger routes across the six-continent taxonomy in defined reference window; positive and negative coverage. | Commercial licensing; get permission to store and redistribute derived flags. |
| Operational eligibility | Airport operators, CAA/FAA/regulator active airport lists + recent operating schedules | Verify current scheduled commercial passenger operations, especially conflict queue. | No global single authoritative proof of negative coverage. |

[OpenSky](https://opensky-network.org/about/faq) is **not** a replacement for schedules or passenger counts: it observes flights, not scheduled service, and coverage is incomplete. Do not infer 5-continent negatives from OpenSky or historic OpenFlights route lists.

## Evidence and review policy

Distinguish `source_candidate`, `machine_correlated`, `operator_verified`, and `reviewed`. A useful positive requires a timestamped source URL and the actual source fact. A negative requires adequate coverage, not absence from a partial feed. Leave uncertain fields `null`. The dataset has 3,244 candidates; review queues in `validation_2026-10.json` should be treated as **triage**, not as proof of error.

### Mandatory human judgment (high priority)
1. **Operations / suspended service:** all 3,244 candidates are source-derived, not operator-verified. Focus first on closed/reopened/new airports and conflict queues: 39 removed vs July, 14 new, 7 type changes, conflict-country and security-sensitive airfields. Approve automatic bulk matches from fresh authoritative regulator sources where possible; review only ambiguous cases.
2. **Passenger denominators:** choose an unambiguous 2025 *total passengers handled* convention. Do not double FAA one-way enplanements, mix transit methodology silently, treat total country's traffic as airport numbers, or mark absent airports below 5M. Manually resolve figures around 5/10/25/50M cutoffs and source conflicts. The top-20 ACI rows in the current CSV should also be rechecked against the exact cited release and usage permissions.
3. **Nonstop 5+ continents:** explicitly review airports plausible to serve five continents, borderline seasonal services, Oceania/Asia assignment, transcontinental country airports, cargo/charter/nonstop/one-stop differences. Complete negative classifications through comprehensive licensed schedule coverage or equivalent documented audit.
4. **Capital service:** review 218 high-confidence served-city matches; also investigate false negatives for airports outside the capital municipality or with missing served-city values (293 records). Use jurisdictional definitions consistently.
5. **Island:** 512 high-probability island-country and territory candidates are preselected; additionally check island airports in mainland countries (e.g., Japan, Indonesia, U.S., Canada, Greece, Brazil). Treat point-in-polygon as suggestions, review reclaimed/artificial islands and bridges.
6. **Infrastructure:** import physical runways from OurAirports first. Review mismatches, closed/temporarily closed facilities, duplicate/parallel runways, helipads/waterways and longest-runway threshold cases (3000 and 4000 m). Elevation 37 missing; prioritize 1000/1500m thresholds and below sea level.
7. **Identifiers and coordinates:** review 31 >50km coordinate disagreements, 5 missing ICAO, 17 missing Wikidata IDs, 293 missing served-city names, code reassignment/renames, and any IATA-collision after snapshot refresh.

### Items a reviewer should NOT have to hand-check individually
* All 3,244 IATA codes/latitude/longitude when authoritative sources and automatic schema tests agree.
* Every runway row if the join, `closed` status, surface-type exclusion, and geometric sanity checks succeed.
* Every country and continent (except border/transcontinental edge cases).
* Uncontroversial negative passenger thresholds when a complete, consistent reporting source covers the country or airport set.

## Proposed reviewer workflow

Make four prioritized CSV queues: `eligibility_exceptions.csv`, `passenger_threshold_conflicts.csv`, `capital_island_edgecases.csv`, `five_continent_candidates.csv`. Each row must show: IATA, name, proposed classification, evidence URL, evidence date, conflicting evidence, status, reviewer decision, reviewer note. Reviewers should make decisions **only on flagged records**, not author the whole dataset.

**Release gate:** Do not enable the playable airport edition until comprehensive evidence enables correct negative and positive classifications for every enabled clue. Feature-level data coverage can be modular: disable an unverified clue template instead of asserting negatives. The prior v1 spec requests passengers and five-continent categories at launch, so launch cannot claim that full scope while either is disabled.
