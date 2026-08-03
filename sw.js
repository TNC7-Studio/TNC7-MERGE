const CACHE_NAME = 'tnc7-merge-cache-v1';

// File utama yang harus di-cache untuk penggunaan offline (App Shell)
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Membuka cache dan menyimpan aset utama');
                return cache.addAll(urlsToCache);
            })
    );
    // Langsung aktif tanpa menunggu tab ditutup
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika file ditemukan di cache, kembalikan dari cache (Cache Hit)
                if (response) {
                    return response;
                }
                
                // Clone request karena fetch request adalah stream yang hanya bisa dipakai sekali
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Pastikan response valid
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response untuk disimpan di cache
                        const responseToCache = response.clone();

                        // Cache file secara dinamis (opsional, dibatasi pada origin yang sama agar tidak menuhin memori dengan file FFmpeg external)
                        if(event.request.url.startsWith(self.location.origin)) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    }
                ).catch(() => {
                    // Jika fetch gagal (misal karena offline), dan requestnya adalah HTML, 
                    // kita bisa mengembalikan fallback page di sini jika ada.
                    console.log('[Service Worker] Fetch gagal, mungkin Anda sedang offline.');
                });
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Hapus cache versi lama jika ada pembaruan
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Mengambil alih kontrol klien (halaman) segera
    );
});
