
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/index.js',
];

self.addEventListener("install", (event) => {
    console.log("[Service Worker] Install");

    event.waitUntil(
        (async () => {
            const cache = await caches.open(DATA_CACHE_NAME);
            console.log("[Service Worker] Caching all: app shell and content");
            await cache.add("/api/transaction");
        })()
    );

    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            console.log("[Service Worker] Caching all: app shell and content");
            await cache.addAll(FILES_TO_CACHE);
        })()
    );

    self.skipWaiting();


});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === CACHE_NAME) {
                        return;
                    }
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then((cache) => {
                return fetch(event.request)
                .then((response) => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch((err) => {
                    return cache.match(event.request);
                });
            })
            .catch((err) => console.log(err))
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request);
            });
        })
    );

});
// transaction schema, is this connected to index.js??
// name, value, date?? 

