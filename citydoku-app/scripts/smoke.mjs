// Browser smoke test against `vite preview` (BASE env, default http://localhost:4173). Needs playwright.
import { chromium, devices } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';
const b = await chromium.launch();
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
for (const [name, opts] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['mobile', devices['iPhone 13']]]) {
  const ctx = await b.newContext({ ...opts, serviceWorkers: 'block' }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(BASE + '/?qa=1'); await p.waitForFunction(() => window.CDQ_QA && window.CDQ);
  ok(await p.evaluate(() => CDQ_QA.runGolden().bad.length === 0 && CDQ_QA.runGolden().checked > 50), name + ': golden fixtures unchanged');
  ok(await p.evaluate(() => CDQ_QA.sweep().every((r) => r.ok)), name + ': preflight passes for sweep');
  ok(await p.locator('#cdqBar').count() === 1, name + ': status bar present');
  await p.waitForSelector('#cdqDlg[open]', { timeout: 3000 }).catch(() => {});
  ok(await p.locator('#cdqDlg[open]').count() === 1, name + ': first-run tutorial opens');
  await p.keyboard.press('Escape');
  await p.click('#cdqPass'); ok(await p.locator('.cdq-stats').count() === 1, name + ': passport opens');
  const sv = await p.evaluate(() => { const r = JSON.parse(JSON.stringify(CDQ_QA.snapshot('ca', '2026-11-20'))); return CDQ_QA.compare(r).ok; });
  ok(sv, name + ': snapshot round-trip');
  // offline queue
  await p.keyboard.press('Escape');
  await ctx.setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline')));
  ok(/Offline/.test(await p.locator('#cdqStat').innerText()), name + ': offline banner');
  await p.evaluate(() => CDQ_SYNC.add({ days: { 'ca:2026-11-20': { ck: [], ts: 1 } } }));
  ok(await p.evaluate(() => CDQ_SYNC.pending() === 1), name + ': queue holds the play while offline');
  ok(/waiting/.test(await p.locator('#cdqStat').innerText()), name + ': banner shows waiting count');
  await p.evaluate(() => localStorage.removeItem('cd:syncq'));
  await ctx.setOffline(false);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  ok(overflow, name + ': no horizontal overflow');
  ok(errs.length === 0, name + ': no page errors ' + errs.join('|').slice(0, 200));
  await ctx.close();
}
await b.close(); process.exit(fail ? 1 : 0);
