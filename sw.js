const CACHE_NAME = 'birthday-page-v2';
const STATIC_CACHE_NAME = 'birthday-page-v2'; // 可以独立更新版本

// 页面相关文件（更新频繁）
const pageUrlsToCache = [
    './',
    'index.html'
];

// 静态资源文件（很少更新）
const staticUrlsToCache = [
    'music/happybirthday.mp3',
    'image/cake.jpeg'
];

// 安装Service Worker时缓存所有资源
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        Promise.all([
            // 缓存页面文件
            caches.open(CACHE_NAME)
                .then(function(cache) {
                    console.log('缓存页面文件');
                    return cache.addAll(pageUrlsToCache);
                }),
            // 缓存静态资源
            caches.open(STATIC_CACHE_NAME)
                .then(function(cache) {
                    console.log('缓存静态资源');
                    return cache.addAll(staticUrlsToCache);
                })
        ])
        .then(() => self.skipWaiting()) // 立即激活新版本
    );
});

// 拦截网络请求并使用缓存
self.addEventListener('fetch', function(event) {
    const requestUrl = event.request.url;

    // 判断请求的是静态资源还是页面
    if (staticUrlsToCache.some(staticUrl => requestUrl.includes(staticUrl))) {
        // 对于静态资源，优先使用缓存，失败时再请求网络
        event.respondWith(
            caches.open(STATIC_CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(response) {
                    return response || fetch(event.request).then(function(networkResponse) {
                        // 可选：将新获取的静态资源存入缓存
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // 对于页面文件，可以使用网络优先策略或缓存优先策略
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match(event.request);
            })
        );
    }
});

// 更新缓存版本时删除旧缓存
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    var cacheWhitelist = [CACHE_NAME, STATIC_CACHE_NAME];

    event.waitUntil(
        Promise.all([
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            console.log('删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim() // 立即控制所有页面
        ])
    );
});
