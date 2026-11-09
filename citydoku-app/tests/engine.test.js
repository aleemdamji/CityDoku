import test from 'node:test';
import assert from 'node:assert/strict';
import * as Q from '../src/quality/engine.js';

const sets9 = (n) => Array.from({ length: 9 }, (_, i) => Array.from({ length: n }, (_, k) => i * 100 + k));

test('normalize strips accents and punctuation', () => assert.equal(Q.normalize("Montréal–Nord, QC"), 'montreal nord qc'));

test('hasMatching: individually solvable cells can still be unsolvable together', () => {
  const sets = [[1], [1], [1, 2, 3], [4], [5], [6], [7], [8], [9]];
  assert.equal(Q.hasMatching(sets), false);
  assert.equal(Q.hasMatching(sets9(3)), true);
});

test('qualityScore: healthy grid passes, empty/duplicate fail', () => {
  const fam = (id) => id[0];
  const good = Q.qualityScore(sets9(8), ['a1', 'b1', 'c1'], ['d1', 'e1', 'f1'], fam);
  assert.equal(good.passed, true); assert.ok(good.score >= 75);
  const bad = Q.qualityScore([[], ...sets9(8).slice(1)], ['a1', 'a1', 'c1'], ['d1', 'e1', 'f1'], fam);
  assert.equal(bad.passed, false); assert.ok(bad.metrics.empty === 1 && bad.metrics.dupIds === 1);
  assert.ok(bad.score < good.score);
});

test('difficultyBands: few obscure answers are harder than many famous ones', () => {
  const pop = { famous: 5e6, obscure: 4e3 };
  const easy = Q.difficultyBands([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]], () => pop.famous);
  const hard = Q.difficultyBands([[0, 1]], () => pop.obscure);
  assert.ok(hard.mean > easy.mean);
  assert.equal(Q.difficultyBands([[]], () => 1).cells[0].band, 'impossible');
  assert.equal(Q.difficultyBands([[0]], () => 1, { 0: 1 }).cells[0].count, 1);
});

test('preflight reports empties, duplicates, missing translations and matching', () => {
  const rows = ['r1', 'r2', 'r3'], cols = ['c1', 'c2', 'c3'];
  const ok = Q.preflight({ sets: sets9(4), rows, cols, labelsOf: () => ['en', 'fr'], langSlots: [0, 1] });
  assert.equal(ok.ok, true);
  const empty = Q.preflight({ sets: [[], ...sets9(4).slice(1)], rows, cols });
  assert.equal(empty.ok, false);
  const dup = Q.preflight({ sets: sets9(4), rows: ['r1', 'r1', 'r3'], cols });
  assert.ok(dup.errors.some((e) => /duplicate/.test(e)));
  const nolabel = Q.preflight({ sets: sets9(4), rows, cols, labelsOf: (id) => (id === 'r2' ? ['en', ''] : ['en', 'fr']), langSlots: [0, 1] });
  assert.ok(nolabel.errors.some((e) => /r2/.test(e)));
  const nomatch = Q.preflight({ sets: [[1], [1], ...sets9(4).slice(2)], rows, cols });
  assert.ok(nomatch.errors.some((e) => /different answers/.test(e)));
});

test('explainRarity matches the game formula and validates input', () => {
  // game: (live + K*est/100)/(n+K)*100 with est in percent
  const live = 3, n = 12, estPct = 20, K = 5;
  const game = ((live + (K * estPct) / 100) / (n + K)) * 100;
  const r = Q.explainRarity(3, 12, 0.2);
  assert.ok(Math.abs(r.smoothed - game) < 1e-9);
  assert.equal(r.sample, 'moderate');
  assert.equal(Q.explainRarity(0, 0, 0.3).observed, null);
  assert.equal(Q.explainRarity(0, 3, 0.1).sample, 'low');
  assert.equal(Q.explainRarity(1, 80, 0.1).sample, 'higher');
  assert.throws(() => Q.explainRarity(5, 3, 0.1), RangeError);
  assert.throws(() => Q.explainRarity(1, 3, 1.5), RangeError);
});

test('snapshots detect added/removed answers and tampering', () => {
  const answers = Array.from({ length: 9 }, (_, i) => [`a${i}`, `b${i}`]);
  const snap = Q.freezePuzzle({ edition: 'ca', date: '2026-11-08', level: 'mixed', rows: ['r1', 'r2', 'r3'], cols: ['c1', 'c2', 'c3'], answers });
  assert.equal(Q.verifySnapshot(snap), true);
  assert.equal(Q.compareSnapshot(snap, { rows: snap.rows, cols: snap.cols, answers }).ok, true);
  const changed = answers.map((a) => [...a]); changed[2] = ['a2', 'z']; 
  const cmp = Q.compareSnapshot(snap, { rows: snap.rows, cols: snap.cols, answers: changed });
  assert.equal(cmp.ok, false); assert.deepEqual(cmp.changed[0].added, ['z']); assert.deepEqual(cmp.changed[0].removed, ['b2']);
  assert.equal(Q.compareSnapshot(snap, { rows: ['x', 'r2', 'r3'], cols: snap.cols, answers }).sameClues, false);
  assert.equal(Q.verifySnapshot({ ...snap, date: '2026-11-09' }), false);
});

test('profile, passport and achievements count only finished games', () => {
  const info = { 'x|1': { region: 'ON', country: 'Canada', continent: 'North America' }, 'x|2': { region: 'QC', country: 'Canada', continent: 'North America' }, 'x|3': { region: 'FR', country: 'France', continent: 'Europe' } };
  const lookup = (e, k) => info[k] || null;
  const plays = [
    { edition: 'ca', date: '2026-11-01', done: true, n: 9, rarity: 40, cells: ['x|1', 'x|2', 'x|3', null, null, null, null, null, null] },
    { edition: 'ca', date: '2026-11-02', done: true, n: 3, rarity: 120, cells: ['x|1', null, null, null, null, null, null, null, null] },
    { edition: 'ca', date: '2026-11-03', done: true, late: true, n: 1, rarity: 90, cells: ['x|2', null, null, null, null, null, null, null, null] },
    { edition: 'ca', date: '2026-11-04', done: false, n: 5, cells: ['x|3', null, null, null, null, null, null, null, null] },
  ];
  const s = Q.buildProfile(plays, lookup);
  assert.equal(s.games, 3); assert.equal(s.places, 3); assert.equal(s.countries, 2); assert.equal(s.continents, 2);
  assert.equal(s.bestRarity, 40); assert.equal(s.longestRun, 2); assert.equal(s.perfect, 1);
  const a = Object.fromEntries(Q.achievements(s).map((x) => [x.id, x.unlocked]));
  assert.equal(a.first, true); assert.equal(a.perfect, true); assert.equal(a.streak3, false); assert.equal(a.places25, false);
});

test('sanitizeBackup rejects malformed and oversized input and keeps valid days', () => {
  const day = { ck: ['A|ON', null, null, null, null, null, null, null, null], log: [[0, 'A|ON', 1]], done: true };
  const good = Q.sanitizeBackup({ schema: 1, app: 'citydoku', days: { 'ca:daily:2026-11-08': day } });
  assert.equal(good.ok, true); assert.deepEqual(Object.keys(good.days), ['ca:daily:2026-11-08']);
  assert.equal(Q.sanitizeBackup('not json').ok, false);
  assert.equal(Q.sanitizeBackup({ schema: 2 }).ok, false);
  const bad = Q.sanitizeBackup({ schema: 1, app: 'citydoku', days: { 'evil:daily:2026-11-08': day, 'ca:daily:2026-11-08': { ck: [1, 2] }, '__proto__': day } });
  assert.deepEqual(Object.keys(bad.days), []);
  assert.equal(Q.sanitizeBackup('x'.repeat(600 * 1024)).ok, false);
});
