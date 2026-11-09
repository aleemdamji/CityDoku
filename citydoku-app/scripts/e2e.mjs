// Full play-through of every edition on desktop and mobile. Needs playwright and `vite preview` (BASE env, default http://localhost:4173).
import { chromium, devices } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';
const b = await chromium.launch();
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const solve = () => window.CDQ.G.sets.map((s) => [...s]); // arrays of city indexes per cell
for (const [dev, opts] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['mobile', devices['iPhone 13']]]) {
  const ctx = await b.newContext({ ...opts, serviceWorkers: 'block' });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e)); p.on('console', (m) => { if (m.type() === 'error' && !/supabase|Failed to load resource|net::/.test(m.text())) errs.push('console ' + m.text()); });
  await p.addInitScript(() => { try { if (!localStorage.getItem('cd:tut')) localStorage.setItem('cd:tut', '1') } catch {} });
  await p.goto(BASE + '/'); await p.waitForFunction(() => window.CDQ && document.querySelector('#edRow button'));
  const eds = await p.$$eval('#edRow button', (bs) => bs.map((x) => x.dataset.ed));
  ok(eds.join() === 'global,ca,us,ap', `${dev}: picker shows ${eds.join()}`);
  for (const ed of ['global', 'ca', 'us', 'ap']) {
    await p.click(`#edRow button[data-ed="${ed}"]`); await p.waitForTimeout(300);
    ok(await p.evaluate(() => CDQ.ED) === ed, `${dev}/${ed}: edition switched`);
    ok((await p.evaluate(() => location.hash)).length > 1, `${dev}/${ed}: hash set`);
    // languages
    const langs = await p.$$eval('#langTabs button', (bs) => bs.map((x) => x.dataset.lang || x.textContent.trim()));
    for (const l of langs.slice(0, 3)) {
      await p.evaluate((l) => { const bt = [...document.querySelectorAll('#langTabs button')].find((x) => (x.dataset.lang || x.textContent.trim()) === l); bt && bt.click(); }, l);
      await p.waitForTimeout(120);
      const how = await p.locator('#howto').innerText();
      if (ed === 'ap') ok(!/canad/i.test(how), `${dev}/ap/${l}: howto not Canadian`);
    }
    await p.evaluate(() => { const bt = [...document.querySelectorAll('#langTabs button')][0]; bt && bt.click(); });
    // daily play: solve all 9 through the UI
    await p.click('#tabDaily'); await p.waitForTimeout(200);
    const sets = await p.evaluate(solve);
    // distinct assignment (backtracking)
    const used = new Set(); const pick = Array(9).fill(null);
    const bt = (i) => { if (i === 9) return true; for (const c of sets[i]) { if (used.has(c)) continue; used.add(c); pick[i] = c; if (bt(i + 1)) return true; used.delete(c); } return false; };
    ok(bt(0), `${dev}/${ed}: daily grid solvable with 9 distinct answers`);
    for (let i = 0; i < 9; i++) {
      const name = await p.evaluate((c) => CDQ.CITIES[c].n, pick[i]);
      if (!(await p.locator('#q').isVisible())) await p.click(`#board .cell[data-i="${i}"]`);
      await p.fill('#q', name); await p.waitForTimeout(120);
      const btn = p.locator('#results li button').filter({ hasText: name }).first();
      if (await btn.count()) await btn.click(); else await p.locator('#results li button').first().click();
      await p.waitForTimeout(150);
    }
    const st = await p.evaluate(() => ({ done: CDQ.S.done, ok: CDQ.S.cells.filter((x) => x != null).length }));
    ok(st.ok === 9 && st.done, `${dev}/${ed}: all 9 squares filled and game done (${st.ok})`);
    ok(await p.locator('#endPanel').isVisible(), `${dev}/${ed}: end panel visible`);
    await p.click('#imgBtn'); await p.waitForSelector('#imgDlg[open]', { timeout: 4000 }).catch(() => {});
    ok(await p.locator('#imgDlg[open]').count() === 1, `${dev}/${ed}: share image dialog opens`);
    await p.keyboard.press('Escape');
    // archive + free
    await p.click('#tabArchive'); await p.waitForTimeout(200);
    const mode = await p.evaluate(() => CDQ.mode); const opts2 = await p.locator('#archDate option').count();
    ok(opts2 > 0 ? mode === 'archive' : mode === 'daily', `${dev}/${ed}: archive (${opts2} dates) handled, mode=${mode}`);
    await p.click('#tabFree');
    for (const lvl of ['easy', 'medium', 'hard', 'mixed']) {
      await p.selectOption('#diff', lvl).catch(() => {}); await p.click('#newGrid').catch(() => {}); await p.waitForTimeout(150);
      ok(await p.evaluate(() => CDQ.G.sets.every((s) => s.length > 0)), `${dev}/${ed}/free-${lvl}: every cell has an answer`);
    }
    await p.click('#tabFree'); await p.click('#newGrid').catch(() => {}); await p.waitForTimeout(150);
    const wrong = await p.evaluate(() => { const g = CDQ.G.sets[0]; const s = new Set(g); const i = CDQ.CITIES.findIndex((c, k) => !s.has(k)); return CDQ.CITIES[i].n; });
    await p.click('#board .cell[data-i="0"]'); await p.waitForTimeout(250); await p.fill('#q', wrong); await p.waitForTimeout(150);
    await p.locator('#results li button').first().click(); await p.waitForTimeout(200);
    const left1 = await p.evaluate(() => CDQ.S.guesses); ok(left1 === 8, `${dev}/${ed}: wrong guess costs one guess (${left1})`);
    await p.click('#tabDaily');
  }
  // reload keeps state, stale edition handled
  await p.evaluate(() => localStorage.setItem('edition', JSON.stringify('au'))); await p.goto(BASE + '/'); await p.waitForFunction(() => window.CDQ);
  ok(await p.evaluate(() => CDQ.ED) === 'global', `${dev}: stale saved edition falls back to global`);
  await p.goto(BASE + '/#airports'); await p.waitForFunction(() => window.CDQ); ok(await p.evaluate(() => CDQ.ED) === 'ap', `${dev}: #airports deep link`);
  // sign-in dialog
  const sign = p.locator('#acct button, #acct a').first();
  if (await sign.count()) { await sign.click().catch(() => {}); await p.waitForTimeout(300); ok((await p.locator('#authDlg[open], #userDlg[open]').count()) >= 1, `${dev}: account/sign-in dialog opens`); await p.keyboard.press('Escape'); }
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${dev}: no horizontal overflow`);
  ok(errs.length === 0, `${dev}: no page/console errors ${errs.slice(0, 3).join(' | ').slice(0, 300)}`);
  await ctx.close();
}
await b.close(); console.log(fail ? `${fail} FAILED` : 'ALL PASSED'); process.exit(fail ? 1 : 0);
