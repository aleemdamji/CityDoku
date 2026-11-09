// Full audit: node scripts/qa.mjs  (needs `vite preview` running). Prints failures for every edition/date.
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto((process.env.BASE || 'http://localhost:4173') + '/?qa=1'); await p.waitForFunction(() => window.CDQ_QA);
const r = await p.evaluate(() => ({ g: CDQ_QA.runGolden(), s: CDQ_QA.sweep() }));
const bad = r.s.filter((x) => !x.ok);
console.log(`${r.s.length} puzzles, ${bad.length} failing, golden mismatches ${r.g.bad.length}/${r.g.checked}`);
bad.forEach((x) => console.log(x.ed, x.date, x.errors.join('; ')));
await b.close(); process.exit(bad.length || r.g.bad.length ? 1 : 0);
