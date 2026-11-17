const C = 'sf-v9';
const A = ['./', './index.html', './app.js?v=7', './theme.js?v=5', './sb.js?v=1', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(n => {
      const cp = n.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return n;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
