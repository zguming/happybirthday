const CACHE_NAME = 'birthday-page-v3';
const STATIC_CACHE_NAME = 'birthday-static-v1';
const pageUrlsToCache = [
    './',
    'index.html'
];

const staticUrlsToCache = [
    'music/happybirthday.mp3',
       'image/cake.webp',
       'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
       'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
        'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js'
];

self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME)
                .then(function(cache) {
                    return cache.addAll(pageUrlsToCache);
                }),
            caches.open(STATIC_CACHE_NAME)
                .then(function(cache) {
                    return cache.addAll(staticUrlsToCache);
                })
        ])
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', function(event) {
    const requestUrl = event.request.url;

    if (staticUrlsToCache.some(staticUrl => requestUrl.includes(staticUrl))) {
        event.respondWith(
            caches.open(STATIC_CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    var cacheWhitelist = [CACHE_NAME, STATIC_CACHE_NAME];
    event.waitUntil(
        Promise.all([
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});
