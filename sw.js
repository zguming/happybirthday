const VERSION = 'birthday-v19';
const CORE_ASSETS = [
    './',
    './index.html',
    './image/cake.webp',
    './music/happybirthday.mp3'
];

const FONT_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(VERSION)
            .then(function(cache) { return cache.addAll(CORE_ASSETS); })
            .then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        Promise.all([
            caches.keys().then(function(names) {
                return Promise.all(
                    names.map(function(name) {
                        if (name !== VERSION) return caches.delete(name);
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', function(event) {
    var request = event.request;
    if (request.method !== 'GET') return;

    var url = new URL(request.url);

    if (url.origin === location.origin) {
        /* 本地资源：缓存优先，离线导航回退到首页 */
        event.respondWith(
            caches.match(request).then(function(hit) {
                if (hit) return hit;
                return fetch(request).then(function(res) {
                    if (res && res.ok) {
                        var copy = res.clone();
                        caches.open(VERSION).then(function(cache) { cache.put(request, copy); });
                    }
                    return res;
                }).catch(function() {
                    if (request.mode === 'navigate') return caches.match('./index.html');
                });
            })
        );
    } else if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
        /* 字体：缓存优先，未命中走网络并尝试补缓存（opaque 响应 put 可能失败，忽略即可） */
        event.respondWith(
            caches.match(request).then(function(hit) {
                if (hit) return hit;
                return fetch(request).then(function(res) {
                    var copy;
                    try { copy = res.clone(); } catch (e) { return res; }
                    caches.open(VERSION).then(function(cache) {
                        cache.put(request, copy).catch(function() {});
                    });
                    return res;
                }).catch(function() { return new Response('', { status: 504 }); });
            })
        );
    }
});
