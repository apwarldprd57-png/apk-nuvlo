const cacheName = 'site-cache-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  // Add any other files you want cached
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
