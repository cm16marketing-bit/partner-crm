// Partner CRM Service Worker v3
// Strategy: Network-first for API calls, Cache-first for app shell only.
// Google Sheets/Drive API responses are NEVER cached to ensure fresh data on all devices.
 
const CACHE_NAME = 'partner-crm-v3';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const API_PATTERNS = ['googleapis.com', 'accounts.google.com', 'docs.google.com'];
 
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});
 
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
self.addEventListener('fetch', e => {
  const url = e.request.url;
 
  // Never cache Google API calls — always go to network for fresh data
  if (API_PATTERNS.some(p => url.includes(p))) {
    e.respondWith(fetch(e.request));
    return;
  }
 
  // App shell: network first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
