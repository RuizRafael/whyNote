const STATIC_CACHE = 'static-v0.1';

const APP_SHELL = [
    //'/', //Para desarrollo
    'index.html',
    'assets/css/style.css',
    'assets/js/js.js',
    'assets/img/createFolder.svg',
    'assets/img/createNote.svg',
    'assets/img/display.svg',
    'assets/img/menu.svg',

];

self.addEventListener('install', e => {
    console.log('Event install SW')
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
    e.waitUntil(cacheStatic);
});

self.addEventListener('activate', e => {

    console.log('SW activado');
});

self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) return res;
        return fetch(e.request).then(newRes => {
            return newRes;
        })
    })
    e.respondWith(respuesta);
});
