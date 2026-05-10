// Partner CRM Service Worker v5
// Network-first for everything. API calls are NEVER cached.
// v5: bumped to force cache invalidation after sync bug fix
const CACHE = 'partner-crm-v5';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const NO_CACHE = ['googleapis.com', 'accounts.google.com', 'docs.google.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache Google API calls — always fresh data
  if (NO_CACHE.some(p => e.request.url.includes(p))) {
    e.respondWith(fetch(e.request));
    return;
  }
  // App shell: network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
