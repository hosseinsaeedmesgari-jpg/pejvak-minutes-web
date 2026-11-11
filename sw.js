/* PEJVAK Minutes PWA v1.3: application assets only. Never cache meeting data or backup JSON. */
const CACHE_NAME = 'pejvak-shell-v1.3.0';
const BASE = new URL('./', self.location.href);
const ASSETS = ['','index.html','logo.png','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.map(path => new URL(path,BASE).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pejvak-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(c=>c.put(new URL('index.html',BASE).href,copy)))}
      return response;
    }).catch(() => caches.match(new URL('index.html',BASE).href)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
