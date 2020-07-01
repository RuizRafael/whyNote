const STATIC_CACHE = 'static-06-2020';
const DYNAMIC_CACHE = 'dynamic-06-02020';
const INMUTABLE_CACHE = 'inmutable-06-2020';

const DYNAMIC_CACHE_LIMIT = 100;


function limpiarCache(cacheName, numItems) {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys()
                .then(keys => {
                    if (keys.length > numItems) {
                        cache.delete(keys[0])
                            .then(limpiarCache(cacheName, numItems));
                    }
                });
        });
}


const APP_SHELL = [
    //'/', //Para desarrollo
    'dateInputtest.html',
    'js.js',
    'icon1.png',
    'sw.js'

];



self.addEventListener('install', e => {

    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL));



    e.waitUntil(Promise.all([cacheStatic]));
});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then(keys => {

        keys.forEach(key => {
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil(respuesta);
});


self.addEventListener('fetch', e => {

    // Cache with Network Fallback
    const respuesta = caches.match(e.request).then(res => {

        if (res) {
            return res;
        }

    });

    e.respondWith(respuesta);
});
