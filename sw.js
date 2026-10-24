var CACHE = 'crm-v3';
var ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('googleapis.com') !== -1 || url.indexOf('accounts.google.com') !== -1 || url.indexOf('apis.google.com') !== -1 || url.indexOf('gstatic.com') !== -1 || url.indexOf('cdn.jsdelivr.net') !== -1) {
    e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
  } else {
    if (e.request.mode === 'navigate' || url.indexOf('.html') !== -1) {
      e.respondWith(fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      }).catch(function() { return caches.match(e.request); }));
    } else {
      e.respondWith(caches.match(e.request).then(function(r) { return r || fetch(e.request); }));
    }
  }
});
