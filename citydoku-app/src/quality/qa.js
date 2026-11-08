// QA console, only loaded with ?qa=1. Reports preflight/quality/difficulty for every edition and date, and checks golden fixtures.
import { preflight, qualityScore, difficultyBands, hash32, freezePuzzle, compareSnapshot, ALGO_VERSION } from './engine.js';
import golden from './fixtures/golden.json';

const Q = () => window.CDQ;
const addDays = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

export function puzzleFor(ed, date) {
  const q = Q();
  return q.withEd(ed, () => {
    const g = q.generate(q.SEED(ed) + date, q.dailyLevel(date), ed === 'ca' ? q.legacyCaDay(date) : false);
    return { g, rows: g.rows.map(String), cols: g.cols.map(String), answers: g.sets.map((s) => [...s].map((i) => q.ckey(i)).sort()), cities: q.CITIES, sets: g.sets };
  });
}
export function fingerprint(ed, date) {
  const p = puzzleFor(ed, date);
  return hash32(JSON.stringify([p.rows, p.cols, p.answers])).toString(16).padStart(8, '0');
}
export function audit(ed, date) {
  const q = Q();
  const p = puzzleFor(ed, date);
  const sets = p.sets.map((s) => [...s]);
  const pre = preflight({ sets, rows: p.rows, cols: p.cols });
  const bands = difficultyBands(sets, (i) => p.cities[i].pop);
  return { ed, date, ok: pre.ok, errors: pre.errors, warnings: pre.warnings, quality: pre.quality, counts: pre.counts, level: q.dailyLevel(date), bands, fp: fingerprint(ed, date) };
}
export function runGolden() {
  const bad = [];
  for (const [key, fp] of Object.entries(golden.fingerprints)) { const [ed, date] = key.split('@'); const now = fingerprint(ed, date); if (now !== fp) bad.push({ key, was: fp, now }); }
  return { checked: Object.keys(golden.fingerprints).length, bad };
}
export function snapshot(ed, date) {
  const p = puzzleFor(ed, date);
  return freezePuzzle({ edition: ed, date, level: Q().dailyLevel(date), rows: p.rows, cols: p.cols, answers: p.answers });
}
export function compare(snap) { const p = puzzleFor(snap.edition, snap.date); return compareSnapshot(snap, { rows: p.rows, cols: p.cols, answers: p.answers }); }
export function sweep(from = '2026-11-08', to = '2027-01-31', eds = ['global', 'ca', 'us']) {
  const out = [];
  for (const ed of eds) for (let d = from; d <= to; d = addDays(d, 1)) out.push(audit(ed, d));
  return out;
}

window.CDQ_QA = { puzzleFor, fingerprint, audit, runGolden, snapshot, compare, sweep, ALGO_VERSION };
if (new URLSearchParams(location.search).get('qa') === '1') {
  const rows = sweep();
  const fails = rows.filter((r) => !r.ok);
  const g = runGolden();
  const el = document.createElement('pre'); el.id = 'cdqQa'; el.style.cssText = 'white-space:pre-wrap;font:12px monospace;padding:8px;background:var(--wash);border:1px solid var(--line)';
  el.textContent = `QA sweep: ${rows.length} puzzles, ${fails.length} failing preflight, golden ${g.checked - g.bad.length}/${g.checked} match\n` + fails.slice(0, 40).map((r) => `${r.ed} ${r.date}: ${r.errors.join('; ')}`).join('\n') + g.bad.map((b) => `\nGOLDEN MISMATCH ${b.key}`).join('');
  document.body.prepend(el);
}
