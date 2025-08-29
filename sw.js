const CACHE_NAME = 'birthday-page-v1';
const urlsToCache = [
    './',  // 主页面
    'index.html',
    'music/happybirthday.mp3',
    'image/cake.jpeg',
    // 可以添加其他需要缓存的资源
];

// 安装Service Worker时缓存页面和资源
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('缓存页面和资源');
                return cache.addAll(urlsToCache);
            })
    );
});

// 拦截网络请求并使用缓存
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // 如果缓存中有就返回缓存，否则发起网络请求
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// 更新缓存版本时删除旧缓存
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
