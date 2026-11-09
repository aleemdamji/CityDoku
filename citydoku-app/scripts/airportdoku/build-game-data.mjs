// Builds src/data/airports.json (the playable Airportdoku set) from the six staging files plus the
// 2026-11-08 research overlay (data/airportdoku/research_2026-11-08.json).
// Overlay row per IATA: [passengers, year label, joint-use flag, served-continent digits or null].
// Digits: 0 Africa, 1 Asia, 2 Europe, 3 North America, 4 South America, 5 Oceania.
// Selection (beta): civilian airports with a sourced passenger figure of 5 million or more, confirmed
// civil/joint-use status, confirmed 2026 scheduled service, and no unresolved route flags. Airports whose
// status is unknown are dropped, never guessed. Airports outside the route research (below ~18.8M
// passengers) carry served=null and count as "no" for the 5+ continents clue (an inference, noted in README).
export const RULE = { minPassengers: 5_000_000 };

const clean = (s) => String(s || '').replace(/\s+(International\s+)?Airport$/i, '').replace(/\s+International$/i, '').trim();

export function buildAirports(rows, overlay) {
  const out = [];
  for (const r of rows) {
    const o = overlay[r.iata];
    if (!o || o[0] < RULE.minPassengers) continue;
    if (!/^[A-Z]{3}$/.test(r.iata || '') || typeof r.lat !== 'number' || typeof r.lon !== 'number' || typeof r.elev !== 'number' || !r.runways || !r.longest || !r.country || !r.cont) continue;
    const city = (r.city || r.municipality || '').trim();
    const a = [...new Set([r.iata, r.icao, city, r.municipality, clean(r.name), ...(r.aliases || [])].filter((x) => x && String(x).trim()).map((x) => String(x).trim()))];
    const served = o[3] || '';
    out.push({ n: r.name, iata: r.iata, icao: r.icao || '', city, p: r.country, cont: r.cont, lat: Math.round(r.lat * 1000) / 1000, lon: Math.round(r.lon * 1000) / 1000, elev: Math.round(r.elev), rw: r.runways, lg: Math.round(r.longest), pop: o[0], py: o[1], jd: o[2], cs: served, c5: served.length >= 5 ? 1 : 0, a });
  }
  out.sort((x, y) => (x.iata < y.iata ? -1 : 1));
  return out;
}
