const C = 'sf-v30';
const A = ['./', './index.html', './app.js?v=28', './theme.js?v=6', './sb.js?v=2', './driver.js?v=1', './driver.css?v=2', './manifest.webmanifest', './icon.svg'];
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
