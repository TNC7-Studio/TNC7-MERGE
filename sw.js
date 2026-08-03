const CACHE_NAME = 'tnc7-merge-v3'; // <--- INI SAYA NAIKKAN JADI V3 AGAR BROWSER MEMUAT ULANG
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
    // Catatan: Library FFmpeg WebAssembly (ffmpeg.min.js & core) berukuran cukup besar,
    // Disarankan tidak di-cache secara agresif di service worker sederhana ini agar RAM tidak penuh, 
    // melainkan mengandalkan cache browser bawaan.
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
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

self.addEventListener('fetch', event => {
    // Abaikan requests dengan skema yang tidak didukung, misal chrome-extension://
    if (!(event.request.url.indexOf('http') === 0)) return; 
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return dari Cache jika ada
                }
                return fetch(event.request); // Ambil dari internet jika belum ada di Cache
            })
    );
});
