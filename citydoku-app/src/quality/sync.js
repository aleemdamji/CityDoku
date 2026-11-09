// Offline-safe saving. Every play is written to a small local queue before it is sent, and removed
// only once the server confirms. Replaying a queued day is idempotent (the server replaces that one
// day), and a queued day is dropped if the server already holds a newer or more complete copy.
// Also copies finished guest games into a new account the first time a player signs in.
const KEY = 'cd:syncq';
const DAY = /^(global|ca|us|ap):daily:(\d{4}-\d{2}-\d{2})$/;
const MAX_QUEUE = 400;

const read = () => { try { const q = JSON.parse(localStorage.getItem(KEY)); return q && typeof q === 'object' && !Array.isArray(q) ? q : {}; } catch { return {}; } };
const persist = (q) => { try { localStorage.setItem(KEY, JSON.stringify(q)); } catch { /* storage full or blocked: the live write still happens */ } };
const day = (item, k) => item.data.days[k];

let flushing = false;

function add(data) {
  if (!data || !data.days) return [];
  const q = read();
  const tokens = [];
  for (const [k, d] of Object.entries(data.days)) {
    if (!/^(global|ca|us|ap):\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    q[k] = { data: { days: { [k]: d }, ...(data.last ? { last: data.last } : {}) }, ts: d.ts || Date.now() };
    tokens.push([k, q[k].ts]);
  }
  const keys = Object.keys(q);
  if (keys.length > MAX_QUEUE) keys.sort((a, b) => q[a].ts - q[b].ts).slice(0, keys.length - MAX_QUEUE).forEach((k) => delete q[k]);
  persist(q);
  status();
  return tokens;
}

function ok(tokens) {
  if (!tokens || !tokens.length) return;
  const q = read();
  for (const [k, ts] of tokens) if (q[k] && q[k].ts === ts) delete q[k];
  persist(q);
  status();
}

const pending = () => Object.keys(read()).length;

function localDays() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (DAY.test(k || '')) out.push(k);
    }
  } catch { /* ignore */ }
  return out;
}

// Finished games played as a guest become account days (once per account, only for days the account lacks).
function migrateGuest() {
  const Q = window.CDQ;
  if (!Q || !Q.UID) return;
  const flag = 'cd:migrated:' + Q.UID;
  try { if (localStorage.getItem(flag)) return; } catch { return; }
  const have = Q.ME && Q.ME.days ? Q.ME.days : {};
  const batch = {};
  for (const lk of localDays()) {
    const [, ed, date] = lk.match(DAY);
    const S = Q.store.get(lk, null);
    const dd = Q.store.get(ed + ':doneDays', {})[date];
    if (!S || !S.done || !dd || !Array.isArray(S.ck) || S.ck.length !== 9 || have[ed + ':' + date]) continue;
    let sig;
    try { sig = Q.withEd(ed, () => Q.sigFor(date)); } catch { continue; }
    batch[ed + ':' + date] = { g: sig, cells: S.ck, log: Array.isArray(S.log) ? S.log.slice(0, 9) : [], done: true, gaveUp: !!S.gaveUp, late: !!dd.late, n: dd.n | 0, rarity: typeof dd.rarity === 'number' ? dd.rarity : null, u: dd.u | 0, ts: Date.now() };
  }
  if (Object.keys(batch).length) add({ days: batch });
  try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
}

async function flush() {
  const Q = window.CDQ;
  if (flushing || !Q || !Q.UID || navigator.onLine === false) { status(); return; }
  flushing = true;
  try {
    migrateGuest();
    const q = read();
    for (const k of Object.keys(q)) {
      const item = q[k];
      const server = Q.ME && Q.ME.days ? Q.ME.days[k] : null;
      const mine = day(item, k);
      if (!mine || (server && ((server.ts || 0) >= (item.ts || 0) || (server.done && !mine.done)))) { const cur = read(); delete cur[k]; persist(cur); continue; }
      try { await Q.write(item.data); const cur = read(); if (cur[k] && cur[k].ts === item.ts) delete cur[k]; persist(cur); } catch (e) { if (e && e.code === 'invalid_argument') { const cur = read(); delete cur[k]; persist(cur); } else break; }
    }
  } finally { flushing = false; status(); }
}

function status() { document.dispatchEvent(new CustomEvent('cd:sync', { detail: { pending: pending(), online: navigator.onLine !== false } })); }

window.CDQ_SYNC = { add, ok, flush, pending, status, migrateGuest, _read: read };
window.addEventListener('online', () => { flush(); status(); });
window.addEventListener('offline', status);
document.addEventListener('visibilitychange', () => { if (!document.hidden) flush(); });
setInterval(flush, 60000);
