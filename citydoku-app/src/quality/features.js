// Quality Lab features: tutorial, discovery, rarity explainer, Passport + achievements, backup, offline/sync status.
// Everything reads from window.CDQ (set by game.js) and never changes puzzle generation.
import { explainRarity, buildProfile, achievements, sanitizeBackup, BACKUP_LIMITS } from './engine.js';

const Q = () => window.CDQ;
const S18 = {
  en: { passport: 'Passport', offline: 'Offline', waiting: (n) => `${n} play${n === 1 ? '' : 's'} waiting to sync`, syncing: 'Syncing…', synced: 'All plays saved',
    pTitle: 'Your Passport', games: 'Games', places: 'Places', regions: 'Regions', countries: 'Countries', continents: 'Continents', perfect: 'Perfect grids', run: 'Longest streak',
    ach: 'Achievements', backup: 'Backup', export: 'Export my plays', import: 'Import a backup', imported: (n) => `Imported ${n} day(s). Reloading…`, importBad: 'That file is not a valid Citydoku backup.',
    close: 'Close', discover: 'Discover', dTitle: 'Places you found', dSrc: 'Facts come from Citydoku’s own dataset; populations are approximate.', pop: 'population',
    tTitle: 'How to play', tBody: 'Each square needs a place that matches both its row clue and its column clue.', tEx: 'Example from a past grid', tOk: 'Got it', tFits: 'fits both',
    rTitle: 'How this percentage is worked out', rObs: (o, n) => `${o}% of ${n} players picked it`, rNone: 'Not enough players yet, so this is an estimate from population.', rEst: (e) => `Population-based estimate: ${e}%`, rMix: (w) => `Estimate weight: ${w}% (fades as more people play)`, rLow: 'Small sample, so this may move.',
    a_first: 'First game', a_regions5: '5 regions', a_continents3: '3 continents', a_places25: '25 places', a_perfect: 'Perfect grid', a_streak3: '3-day streak' },
  fr: { passport: 'Passeport', offline: 'Hors ligne', waiting: (n) => `${n} partie${n > 1 ? 's' : ''} en attente de synchronisation`, syncing: 'Synchronisation…', synced: 'Toutes les parties sont enregistrées',
    pTitle: 'Ton passeport', games: 'Parties', places: 'Lieux', regions: 'Régions', countries: 'Pays', continents: 'Continents', perfect: 'Grilles parfaites', run: 'Plus longue série',
    ach: 'Réussites', backup: 'Sauvegarde', export: 'Exporter mes parties', import: 'Importer une sauvegarde', imported: (n) => `${n} jour(s) importé(s). Rechargement…`, importBad: 'Ce fichier n’est pas une sauvegarde Citydoku valide.',
    close: 'Fermer', discover: 'Découvrir', dTitle: 'Lieux trouvés', dSrc: 'Les faits viennent du jeu de données de Citydoku; les populations sont approximatives.', pop: 'population',
    tTitle: 'Comment jouer', tBody: 'Chaque case demande un lieu qui correspond à l’indice de sa ligne et à celui de sa colonne.', tEx: 'Exemple d’une ancienne grille', tOk: 'Compris', tFits: 'correspond aux deux',
    rTitle: 'Comment ce pourcentage est calculé', rObs: (o, n) => `${o} % des ${n} joueurs l’ont choisi`, rNone: 'Pas encore assez de joueurs; c’est une estimation selon la population.', rEst: (e) => `Estimation selon la population : ${e} %`, rMix: (w) => `Poids de l’estimation : ${w} % (diminue avec les parties)`, rLow: 'Petit échantillon; la valeur peut changer.',
    a_first: 'Première partie', a_regions5: '5 régions', a_continents3: '3 continents', a_places25: '25 lieux', a_perfect: 'Grille parfaite', a_streak3: 'Série de 3 jours' },
  es: { passport: 'Pasaporte', offline: 'Sin conexión', waiting: (n) => `${n} partida${n === 1 ? '' : 's'} pendiente${n === 1 ? '' : 's'} de sincronizar`, syncing: 'Sincronizando…', synced: 'Todas las partidas guardadas',
    pTitle: 'Tu pasaporte', games: 'Partidas', places: 'Lugares', regions: 'Regiones', countries: 'Países', continents: 'Continentes', perfect: 'Cuadrículas perfectas', run: 'Racha más larga',
    ach: 'Logros', backup: 'Copia de seguridad', export: 'Exportar mis partidas', import: 'Importar una copia', imported: (n) => `${n} día(s) importado(s). Recargando…`, importBad: 'Ese archivo no es una copia válida de Citydoku.',
    close: 'Cerrar', discover: 'Descubrir', dTitle: 'Lugares encontrados', dSrc: 'Los datos vienen del conjunto de datos de Citydoku; las poblaciones son aproximadas.', pop: 'población',
    tTitle: 'Cómo jugar', tBody: 'Cada casilla necesita un lugar que cumpla la pista de su fila y la de su columna.', tEx: 'Ejemplo de una cuadrícula pasada', tOk: 'Entendido', tFits: 'cumple ambas',
    rTitle: 'Cómo se calcula este porcentaje', rObs: (o, n) => `${o}% de ${n} jugadores lo eligieron`, rNone: 'Aún no hay suficientes jugadores; es una estimación por población.', rEst: (e) => `Estimación por población: ${e}%`, rMix: (w) => `Peso de la estimación: ${w}% (baja al jugar más gente)`, rLow: 'Muestra pequeña; puede cambiar.',
    a_first: 'Primera partida', a_regions5: '5 regiones', a_continents3: '3 continentes', a_places25: '25 lugares', a_perfect: 'Cuadrícula perfecta', a_streak3: 'Racha de 3 días' },
};
const t = (k, ...a) => { const d = S18[Q()?.LANG] || S18.en; const v = d[k] ?? S18.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EDS = ['global', 'ca', 'us'];
const DAY = /^(global|ca|us):daily:(\d{4}-\d{2}-\d{2})$/;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

// ---------- local plays -> profile ----------
function localPlays() {
  const plays = [];
  const dd = {};
  for (const e of EDS) dd[e] = lsGet(e + ':doneDays', {});
  let keys = [];
  try { keys = Object.keys(localStorage); } catch { /* ignore */ }
  for (const k of keys) {
    const m = DAY.exec(k); if (!m) continue;
    const [, edition, date] = m;
    const st = lsGet(k, null); const meta = dd[edition][date];
    if (!st || !meta || !meta.done) continue;
    plays.push({ edition, date, late: !!meta.late, done: true, gaveUp: !!st.gaveUp, n: meta.n, rarity: meta.rarity, cells: Array.isArray(st.ck) ? st.ck : [] });
  }
  return plays;
}
const indexCache = {};
function lookup(edition, key) {
  const D = Q().DATA[edition]; if (!D) return null;
  const idx = indexCache[edition] || (indexCache[edition] = new Map(D.map((c) => [c.n + '|' + c.p, c])));
  const c = idx.get(key); if (!c) return null;
  return edition === 'global' ? { region: c.p, country: c.cn, continent: c.cont } : { region: c.p, country: edition.toUpperCase(), continent: 'North America' };
}
export const profile = () => buildProfile(localPlays(), lookup);

// ---------- dialog helper ----------
function dlg() {
  let d = document.getElementById('cdqDlg');
  if (!d) { d = document.createElement('dialog'); d.id = 'cdqDlg'; d.setAttribute('aria-labelledby', 'cdqTitle'); document.body.appendChild(d); }
  return d;
}
function show(title, html) {
  const d = dlg();
  d.innerHTML = `<form method="dialog" class="dlg cdq"><strong id="cdqTitle">${esc(title)}</strong>${html}<div class="cdq-actions"><button class="btn" value="cancel">${esc(t('close'))}</button></div></form>`;
  if (!d.open) d.showModal();
  return d;
}

// ---------- Passport ----------
function openPassport() {
  const p = profile();
  const stats = [['games', p.games], ['places', p.places], ['regions', p.regions], ['countries', p.countries], ['continents', p.continents], ['perfect', p.perfect], ['run', p.longestRun]];
  const ach = achievements(p);
  const d = show(t('pTitle'), `
    <dl class="cdq-stats">${stats.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <strong class="cdq-h">${esc(t('ach'))}</strong>
    <ul class="cdq-ach">${ach.map((a) => `<li class="${a.unlocked ? 'on' : ''}"><span aria-hidden="true">${a.unlocked ? '★' : '☆'}</span> ${esc(t('a_' + a.id))}</li>`).join('')}</ul>
    <strong class="cdq-h">${esc(t('backup'))}</strong>
    <div class="cdq-row"><button type="button" class="btn" id="cdqExp">${esc(t('export'))}</button>
    <label class="btn" for="cdqImp">${esc(t('import'))}</label><input type="file" id="cdqImp" accept="application/json,.json" hidden></div>
    <p class="meta" id="cdqMsg" role="status"></p>`);
  d.querySelector('#cdqExp').addEventListener('click', exportBackup);
  d.querySelector('#cdqImp').addEventListener('change', (e) => importBackup(e.target.files?.[0], d.querySelector('#cdqMsg')));
}

// ---------- backup ----------
function exportBackup() {
  const days = {};
  let keys = []; try { keys = Object.keys(localStorage); } catch { /* ignore */ }
  for (const k of keys) {
    if (!DAY.test(k)) continue;
    const st = lsGet(k, null); if (!st || !Array.isArray(st.ck) || st.ck.length !== 9) continue;
    days[k] = { ck: st.ck, log: st.log || [], done: !!st.done, gaveUp: !!st.gaveUp };
  }
  const blob = new Blob([JSON.stringify({ schema: 1, app: 'citydoku', exported: new Date().toISOString(), days })], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'citydoku-backup.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function importBackup(file, msg) {
  if (!file) return;
  if (file.size > BACKUP_LIMITS.bytes) { msg.textContent = t('importBad'); return; }
  const res = sanitizeBackup(await file.text());
  if (!res.ok) { msg.textContent = t('importBad'); return; }
  let n = 0;
  for (const [k, v] of Object.entries(res.days)) {
    const cur = lsGet(k, null);
    if (cur && (cur.done || (cur.log || []).length >= v.log.length)) continue; // never overwrite equal or further-along local play
    const m = DAY.exec(k);
    lsSet(k, { cells: Array(9).fill(null), ck: v.ck, log: v.log, guesses: Math.max(0, 9 - v.log.length), done: v.done, gaveUp: v.gaveUp });
    if (v.done) { const dd = lsGet(m[1] + ':doneDays', {}); if (!dd[m[2]]) { dd[m[2]] = { done: true, n: v.ck.filter(Boolean).length, rarity: undefined, u: 0, late: true }; lsSet(m[1] + ':doneDays', dd); } }
    n++;
  }
  msg.textContent = t('imported', n);
  setTimeout(() => location.reload(), 1200);
}

// ---------- discovery (after completion only) ----------
const fmt = (n) => new Intl.NumberFormat(Q().LANG || 'en').format(n);
function openDiscovery() {
  const q = Q(); if (!q.S?.done) return;
  const rows = q.S.cells.map((ci) => (ci == null ? null : q.CITIES[ci])).filter(Boolean);
  const extra = (c) => (q.ED === 'global' ? [c.cn, c.cont] : q.ED === 'us' ? [q.PV(c.p), c.reg] : [q.PV(c.p)]).filter(Boolean).join(' · ');
  show(t('dTitle'), `<ul class="cdq-disc">${rows.map((c) => `<li><b>${esc(c.n)}</b> <span class="meta">${esc(extra(c))}</span><br><span class="meta">${esc(t('pop'))}: ~${fmt(c.pop)}</span></li>`).join('')}</ul><p class="meta">${esc(t('dSrc'))}</p>`);
}

// ---------- rarity explainer ----------
document.addEventListener('cd:answers', (e) => {
  const q = Q(); const i = e.detail?.cell; const old = document.getElementById('cdqRar'); if (old) old.remove();
  const ci = q.S?.cells?.[i]; if (ci == null) return;
  try {
    const n = q.liveN(i), c = q.liveC(i, ci), est = q.estRate(i, ci);
    const r = explainRarity(Math.min(c, n), n, Math.max(0, Math.min(1, est / 100)));
    const lines = [r.observed != null && n >= 5 ? t('rObs', Math.round(r.observed), n) : t('rNone'), t('rEst', Math.round(r.estimate)), t('rMix', Math.round(r.estimateWeight * 100))];
    if (r.sample === 'low' && n > 0) lines.push(t('rLow'));
    const el = document.createElement('details'); el.id = 'cdqRar'; el.className = 'cdq-rar';
    el.innerHTML = `<summary>${esc(t('rTitle'))}</summary><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    document.getElementById('ansList').insertAdjacentElement('afterend', el);
  } catch { /* explainer is optional */ }
});

// ---------- status bar ----------
function ensureBar() {
  let bar = document.getElementById('cdqBar'); if (bar) return bar;
  const acct = document.getElementById('acct'); if (!acct) return null;
  bar = document.createElement('div'); bar.id = 'cdqBar'; bar.className = 'cdq-bar';
  bar.innerHTML = `<span id="cdqStat" role="status" aria-live="polite"></span><span class="cdq-btns"><button type="button" class="linkbtn" id="cdqDisc" hidden></button><button type="button" class="linkbtn" id="cdqPass"></button></span>`;
  acct.insertAdjacentElement('afterend', bar);
  bar.querySelector('#cdqPass').addEventListener('click', openPassport);
  bar.querySelector('#cdqDisc').addEventListener('click', openDiscovery);
  return bar;
}
function paint() {
  const bar = ensureBar(); if (!bar) return;
  const sy = window.CDQ_SYNC; const pend = sy ? sy.pending() : 0; const online = navigator.onLine !== false;
  const stat = bar.querySelector('#cdqStat');
  stat.textContent = !online ? (pend ? `${t('offline')} · ${t('waiting', pend)}` : t('offline')) : pend ? t('waiting', pend) : '';
  bar.classList.toggle('cdq-warn', !online || pend > 0);
  bar.querySelector('#cdqPass').textContent = t('passport');
  const disc = bar.querySelector('#cdqDisc'); disc.textContent = t('discover'); disc.hidden = !Q().S?.done;
}
document.addEventListener('cd:sync', paint);
document.addEventListener('cd:render', paint);
window.addEventListener('online', paint); window.addEventListener('offline', paint);

// ---------- first-run tutorial ----------
function maybeTutorial() {
  try { if (localStorage.getItem('cd:tut') || EDS.some((e) => Object.keys(lsGet(e + ':doneDays', {})).length)) return; } catch { return; }
  const q = Q(); let ex = '';
  try {
    const date = '2026-01-15';
    q.withEd(q.ED, () => {
      const g = q.generate(q.SEED(q.ED) + date, 0, false);
      const cell = 0, a = [...g.sets[cell]].sort((x, y) => q.DATA[q.ED][y].pop - q.DATA[q.ED][x].pop)[0];
      const city = q.CITIES[a];
      ex = `<p class="meta">${esc(t('tEx'))}:</p><p><b>${esc(q.lab(g.rows[0]))}</b> + <b>${esc(q.lab(g.cols[0]))}</b> → ${esc(city.n)} (${esc(t('tFits'))})</p>`;
    });
  } catch { ex = ''; }
  const d = show(t('tTitle'), `<p>${esc(t('tBody'))}</p>${ex}`);
  d.addEventListener('close', () => { try { localStorage.setItem('cd:tut', '1'); } catch { /* ignore */ } }, { once: true });
}

export function initFeatures() {
  paint();
  setTimeout(maybeTutorial, 600);
}
