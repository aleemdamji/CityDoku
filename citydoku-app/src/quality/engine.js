// Citydoku quality engine: pure functions (no DOM, no imports from the game).
// Everything here works on data passed in by the caller, so it can be unit-tested in Node and
// run in the browser against the game's real clue predicates (see qa.js).

export const ALGO_VERSION = 1;

export const normalize = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function hash32(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const ROWCOL = [0, 1, 2];

// Distinct-answer feasibility: can the nine cells be filled with nine different places? (bipartite matching)
export function hasMatching(sets) {
  const match = new Map();
  const tryCell = (ci, seen) => {
    for (const x of sets[ci]) {
      if (seen.has(x)) continue;
      seen.add(x);
      if (!match.has(x) || tryCell(match.get(x), seen)) { match.set(x, ci); return true; }
    }
    return false;
  };
  return sets.every((_, ci) => tryCell(ci, new Set()));
}

// ---------- quality score (advisory heuristic, 0-100) ----------
export const QUALITY_DEFAULTS = { minAnswers: 2, passScore: 75, maxSparse: 2, minFamilies: 3 };

export function qualityScore(sets, rows, cols, famOf = () => 'x', opts = {}) {
  const o = { ...QUALITY_DEFAULTS, ...opts };
  const counts = sets.map((s) => s.length);
  const ids = [...rows, ...cols];
  const penalties = [];
  const add = (reason, points) => { if (points > 0) penalties.push({ reason, points }); };
  const empty = counts.filter((n) => n === 0).length;
  const sparse = counts.filter((n) => n > 0 && n < o.minAnswers).length;
  const dupIds = ids.length - new Set(ids).size;
  const fams = ids.map(famOf);
  const famCounts = {};
  fams.forEach((f) => { famCounts[f] = (famCounts[f] || 0) + 1; });
  const repeatedFam = Object.values(famCounts).reduce((a, n) => a + Math.max(0, n - 2), 0);
  const mean = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  const sd = Math.sqrt(counts.reduce((a, n) => a + (n - mean) ** 2, 0) / (counts.length || 1));
  const spread = mean ? sd / mean : 0;
  const huge = counts.filter((n) => n > 60).length;
  const distinct = new Set(sets.flat()).size;
  add('empty cells', empty * 25);
  add('sparse cells', sparse * 8);
  add('repeated clue ids', dupIds * 22);
  add('repeated clue families', repeatedFam * 4);
  add('uneven answer counts', Math.min(14, spread * 0.7 * 10));
  add('oversized cells', huge * 3);
  add('few distinct places', distinct < 12 ? 12 : 0);
  const total = penalties.reduce((a, p) => a + p.points, 0);
  const score = clamp(Math.round(100 - total), 0, 100);
  const familyCount = Object.keys(famCounts).length;
  const passed = empty === 0 && dupIds === 0 && sparse <= o.maxSparse && familyCount >= o.minFamilies && score >= o.passScore;
  return { score, passed, counts, penalties, metrics: { empty, sparse, dupIds, spread: +spread.toFixed(3), distinct, families: familyCount, huge } };
}

// ---------- calibrated difficulty (advisory; never relabels published grids) ----------
export const recognition = (pop) => clamp((Math.log10(Math.max(1, pop || 1)) - 3) / 4, 0, 1);

export function difficultyBands(sets, popOf, frequency = {}) {
  const cells = sets.map((s) => {
    if (!s.length) return { count: 0, difficulty: 100, band: 'impossible' };
    const rec = s.reduce((a, i) => a + (typeof frequency[i] === 'number' ? clamp(frequency[i], 0, 1) : recognition(popOf(i))), 0) / s.length;
    const availability = 1 - Math.exp(-s.length / 5);
    const difficulty = Math.round(100 * (1 - (0.55 * availability + 0.45 * rec)));
    return { count: s.length, difficulty, band: difficulty >= 70 ? 'hard' : difficulty >= 40 ? 'medium' : 'easy' };
  });
  const mean = Math.round(cells.reduce((a, c) => a + c.difficulty, 0) / (cells.length || 1));
  const bands = { easy: 0, medium: 0, hard: 0, impossible: 0 };
  cells.forEach((c) => { bands[c.band]++; });
  return { cells, mean, bands };
}

// ---------- preflight ----------
// labelsOf(id) -> array of per-language label strings (index = language slot); langSlots = slots the edition uses.
export function preflight({ sets, rows, cols, labelsOf = null, langSlots = [0], famOf = () => 'x' }) {
  const errors = [], warnings = [];
  const ids = [...rows, ...cols];
  if (rows.length !== 3 || cols.length !== 3 || sets.length !== 9) errors.push('grid must be 3x3');
  if (new Set(ids).size !== ids.length) errors.push('duplicate clue id');
  sets.forEach((s, i) => {
    if (s.length === 0) errors.push(`cell ${i + 1} has no valid answers`);
    else if (s.length === 1) warnings.push(`cell ${i + 1} has a single valid answer`);
    else if (s.length > 60) warnings.push(`cell ${i + 1} has ${s.length} answers`);
  });
  if (!errors.length && !hasMatching(sets)) errors.push('nine different answers are not possible at once');
  if (labelsOf) {
    for (const id of ids) {
      const l = labelsOf(id) || [];
      for (const slot of langSlots) if (!String(l[slot] ?? '').trim()) errors.push(`clue ${id} has no label for language slot ${slot}`);
    }
  }
  const q = qualityScore(sets, rows, cols, famOf);
  return { ok: errors.length === 0, errors, warnings, counts: sets.map((s) => s.length), quality: q.score, qualityPassed: q.passed };
}

// ---------- rarity transparency ----------
// Same smoothing the game uses: rate = (picks + K*estimate) / (players + K). estimate is a 0-1 probability.
export function explainRarity(picks, players, estimate, K = 5) {
  if (![picks, players, estimate, K].every(Number.isFinite) || picks < 0 || players < 0 || K < 0 || estimate < 0 || estimate > 1) throw new RangeError('invalid rarity inputs');
  if (picks > players) throw new RangeError('picks cannot exceed players');
  const smoothed = ((picks + K * estimate) / (players + K)) * 100;
  const observed = players > 0 ? (picks / players) * 100 : null;
  const sample = players < 10 ? 'low' : players < 50 ? 'moderate' : 'higher';
  return { smoothed, observed, estimate: estimate * 100, players, picks, K, sample, estimateWeight: K / (players + K) };
}

// ---------- historical snapshots ----------
export function freezePuzzle({ edition, date, level, rows, cols, answers, datasetVersion = '', algo = ALGO_VERSION }) {
  const body = { schema: 1, edition, date, level, algo, datasetVersion, rows: [...rows], cols: [...cols], answers: answers.map((a) => [...a].sort()) };
  return { ...body, signature: hash32(JSON.stringify(body)).toString(16).padStart(8, '0') };
}
export function verifySnapshot(s) {
  if (!s || s.schema !== 1 || !Array.isArray(s.answers) || s.answers.length !== 9) return false;
  const { signature, ...body } = s;
  return hash32(JSON.stringify(body)).toString(16).padStart(8, '0') === signature;
}
export function compareSnapshot(snap, current) {
  const sameClues = JSON.stringify(snap.rows) === JSON.stringify(current.rows) && JSON.stringify(snap.cols) === JSON.stringify(current.cols);
  const cells = snap.answers.map((old, i) => {
    const now = new Set(current.answers?.[i] || []);
    const was = new Set(old);
    return { cell: i + 1, added: [...now].filter((x) => !was.has(x)).sort(), removed: [...was].filter((x) => !now.has(x)).sort() };
  });
  const changed = cells.filter((c) => c.added.length || c.removed.length);
  return { ok: sameClues && changed.length === 0, sameClues, changed, integrity: verifySnapshot(snap) };
}

// ---------- player profile, Passport, achievements ----------
// plays: [{edition,date,late,done,gaveUp,n,rarity,cells:[ckey|null x9]}]; lookup(edition, ckey) -> {region,country,continent} | null
export function buildProfile(plays, lookup) {
  const done = plays.filter((p) => p && p.done);
  const places = new Set(), regions = new Set(), countries = new Set(), continents = new Set(), editions = new Set();
  const byEdition = {};
  for (const p of done) {
    editions.add(p.edition);
    for (const k of p.cells || []) {
      if (typeof k !== 'string') continue;
      const info = lookup(p.edition, k);
      if (!info) continue;
      places.add(p.edition + '|' + k);
      byEdition[p.edition] = byEdition[p.edition] || { places: new Set(), regions: new Set() };
      byEdition[p.edition].places.add(k);
      if (info.region) { regions.add(p.edition + '|' + info.region); byEdition[p.edition].regions.add(info.region); }
      if (info.country) countries.add(info.country);
      if (info.continent) continents.add(info.continent);
    }
  }
  const rs = done.map((p) => p.rarity).filter((x) => typeof x === 'number');
  const days = new Set(done.filter((p) => !p.late && p.date).map((p) => p.date));
  let run = 0, best = 0, prev = null;
  for (const d of [...days].sort()) {
    run = prev && Math.round((Date.parse(d + 'T12:00:00Z') - Date.parse(prev + 'T12:00:00Z')) / 864e5) === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = d;
  }
  return {
    games: done.length, perfect: done.filter((p) => p.n === 9).length,
    places: places.size, regions: regions.size, countries: countries.size, continents: continents.size, editions: editions.size,
    bestRarity: rs.length ? Math.min(...rs) : null, longestRun: best,
    byEdition: Object.fromEntries(Object.entries(byEdition).map(([e, v]) => [e, { places: v.places.size, regions: v.regions.size }])),
    continentList: [...continents].sort(),
  };
}

export const ACHIEVEMENTS = [
  { id: 'first', test: (s) => s.games >= 1 },
  { id: 'regions5', test: (s) => s.regions >= 5 },
  { id: 'continents3', test: (s) => s.continents >= 3 },
  { id: 'places25', test: (s) => s.places >= 25 },
  { id: 'perfect', test: (s) => s.perfect >= 1 },
  { id: 'streak3', test: (s) => s.longestRun >= 3 },
];
export const achievements = (stats) => ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: !!a.test(stats) }));

// ---------- backups ----------
export const BACKUP_LIMITS = { bytes: 512 * 1024, days: 2000 };
const DAY_KEY = /^(global|ca|us|ap):daily:\d{4}-\d{2}-\d{2}$/;

export function sanitizeBackup(raw, limits = BACKUP_LIMITS) {
  const errors = [];
  let obj = raw;
  if (typeof raw === 'string') {
    if (raw.length > limits.bytes) return { ok: false, errors: ['file too large'], days: {} };
    try { obj = JSON.parse(raw); } catch { return { ok: false, errors: ['not valid JSON'], days: {} }; }
  }
  if (!obj || obj.schema !== 1 || obj.app !== 'citydoku' || typeof obj.days !== 'object' || Array.isArray(obj.days)) return { ok: false, errors: ['not a Citydoku backup'], days: {} };
  const out = {};
  let n = 0;
  for (const [k, v] of Object.entries(obj.days)) {
    if (n >= limits.days) { errors.push('too many days'); break; }
    if (!DAY_KEY.test(k) || !v || typeof v !== 'object' || !Array.isArray(v.ck) || v.ck.length !== 9) { errors.push('skipped ' + String(k).slice(0, 40)); continue; }
    const ck = v.ck.map((x) => (x == null ? null : typeof x === 'string' && x.length <= 120 ? x : undefined));
    if (ck.includes(undefined)) { errors.push('skipped ' + k); continue; }
    const guessesUsed = Array.isArray(v.log) ? v.log.length : 0;
    if (guessesUsed > 9) { errors.push('skipped ' + k); continue; }
    out[k] = { ck, log: (v.log || []).slice(0, 9).filter((e) => Array.isArray(e) && typeof e[1] === 'string' && e[1].length <= 120).map((e) => [Number(e[0]) | 0, e[1], e[2] ? 1 : 0]), done: !!v.done, gaveUp: !!v.gaveUp };
    n++;
  }
  return { ok: true, errors, days: out };
}
