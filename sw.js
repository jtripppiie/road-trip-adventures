/* Offline cache for Road Trip Adventures.
   Static, no backend — caches the app shell so it keeps working after the
   first load even with no signal. Bump CACHE_VERSION when assets change. */
const CACHE_VERSION = 'rta-v7';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/roadside-logo.png',
  './js/data/trivia.js',
  './js/data/community-trivia.js',
  './js/data/scavenger.js',
  './js/data/questions.js',
  './js/data/jokes.js',
  './js/data/trivia-cleanup.js',
  './js/games/hide-seek-data.js',
  './js/games/hide-seek-art.js',
  './js/games/pong-data.js',
  './js/games/pong-art.js',
  // Vendored offline graphics engine, available for future games.
  './vendor/kontra.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  // Only handle same-origin GET requests; let everything else (fonts, etc.) pass through.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
