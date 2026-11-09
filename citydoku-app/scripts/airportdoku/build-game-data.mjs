// Builds src/data/airports.json (the playable Airportdoku set) from the six staging files.
// Pure function, so it runs the same in Node and in a browser. Selection rule (beta): airports classed
// "large" with 2+ runways or a runway of 3,000 m or more. Nothing is guessed: rows missing a field the
// clues need are dropped rather than filled in.
export const RULE = { type: 'large', minRunways: 2, minLongest: 3000 };

const clean = (s) => String(s || '').replace(/\s+(International\s+)?Airport$/i, '').replace(/\s+International$/i, '').trim();

export function buildAirports(rows) {
  const out = [];
  for (const r of rows) {
    if (r.airportType !== RULE.type || r.sourceScheduled !== true) continue;
    if (!((r.runways || 0) >= RULE.minRunways || (r.longest || 0) >= RULE.minLongest)) continue;
    if (!/^[A-Z]{3}$/.test(r.iata || '') || typeof r.lat !== 'number' || typeof r.lon !== 'number' || typeof r.elev !== 'number' || !r.runways || !r.longest || !r.country || !r.cont) continue;
    const city = (r.city || r.municipality || '').trim();
    const a = [...new Set([r.iata, r.icao, city, r.municipality, clean(r.name), ...(r.aliases || [])].filter((x) => x && String(x).trim()).map((x) => String(x).trim()))];
    const prom = Math.round(1e6 * (0.6 + 0.4 * Math.min(r.runways, 4)) * (r.longest >= 3500 ? 1.5 : 1));
    out.push({ n: r.name, iata: r.iata, icao: r.icao || '', city, p: r.country, cont: r.cont, lat: Math.round(r.lat * 1000) / 1000, lon: Math.round(r.lon * 1000) / 1000, elev: Math.round(r.elev), rw: r.runways, lg: Math.round(r.longest), pop: prom, a });
  }
  out.sort((x, y) => (x.iata < y.iata ? -1 : 1));
  return out;
}
