// 주누 마이링크 서비스워커 (0.01초 즉시 구동 & 오프라인 100% 작동)
const CACHE_NAME = 'joonoo-mylink-v102';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './logo-horizontal.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  if (e.request.url.includes('?t=')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((cached) => {
        const networkFetch = fetch(e.request)
          .then((res) => {
            if (res && res.status === 200) {
              cache.put(e.request, res.clone());
            }
            return res;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    )
  );
});
