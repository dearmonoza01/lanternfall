/* Lanternfall service worker. BUILD id changes every build, so browsers pick up a new game version. */
const BUILD = 'e709cd6286';
const HTML_CACHE = 'lf-html-' + BUILD;
const ASSET_CACHE = 'lf-assets-v1'; // asset names are content hashes -> never need invalidating

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(HTML_CACHE);
    await c.add(new Request('index.html', { cache: 'no-cache' })); // bypass host cache so the new build is really fetched
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('lf-html-') && k !== HTML_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const path = url.pathname;
  if (path.includes('/assets/')) {                      // hashed assets: cache-first, forever
    e.respondWith((async () => {
      const c = await caches.open(ASSET_CACHE);
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    })());
    return;
  }
  if (req.mode === 'navigate' || path.endsWith('/') || path.endsWith('/index.html')) { // game page: from cache (ignore ?flags)
    e.respondWith((async () => {
      const c = await caches.open(HTML_CACHE);
      return (await c.match('index.html', { ignoreSearch: true })) || fetch(req);
    })());
  }
});
