const CACHE_NAME = 'tnc7-merge-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Kita tidak me-cache ffmpeg core karena ukurannya besar dan butuh Cross-Origin-Opener-Policy
  // yang sering bermasalah jika disajikan dari cache sederhana tanpa header yang tepat.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Hanya intercept request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache if found
        if (response) {
          return response;
        }
        
        // Fetch from network if not in cache
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Jangan cache script CDN/external disini secara membabi buta 
                // untuk menghindari masalah CORS. Khususkan untuk origin yang sama.
                if (event.request.url.startsWith(self.location.origin)) {
                     cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
