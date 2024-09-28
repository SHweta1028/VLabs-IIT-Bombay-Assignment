const CACHE_NAME = 'chemical-inventory-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/chemical_data.json',
    '/images/tick.svg',
    '/images/blue_tick.svg',
    '/images/icons8-plus.svg',
    '/images/up_arrow.svg',
    '/images/down_arrow.svg',
    '/images/delete.svg',
    '/images/reset.svg',
    '/images/save.svg',
    // Add any other assets you want to cache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
