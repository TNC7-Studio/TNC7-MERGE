const CACHE_NAME = 'tnc7-marge-v13';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Instalasi Service Worker & Cache file statis
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Menghapus cache lama jika ada update versi
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Mengambil dari Cache (Jika offline) atau dari Jaringan
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cache if found, else fetch from network
                return response || fetch(event.request);
            })
    );
});
