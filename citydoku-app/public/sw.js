// Citydoku service worker: lets the game open and play offline.
// Hashed build files are cached once; the page itself is fetched fresh when online. Never touches Supabase.
const CACHE = 'cd-shell-v2';
const MAX_ENTRIES = 80;

self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.webmanifest']).catch(() => {}))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });

async function trim(cache) { const ks = await cache.keys(); if (ks.length > MAX_ENTRIES) await Promise.all(ks.slice(0, ks.length - MAX_ENTRIES).map((k) => cache.delete(k))); }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname === '/sw.js') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { if (res.ok && url.pathname === '/') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('/', copy)); } return res; }).catch(() => caches.match('/').then((r) => r || Response.error())));
    return;
  }
  if (url.pathname.startsWith('/assets/') || /\.(png|webmanifest|ico|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy).then(() => trim(c))); } return res; })));
  }
});
