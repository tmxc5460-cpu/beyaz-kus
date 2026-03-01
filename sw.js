// Service Worker - Offline çalışma için
const CACHE_NAME = 'beyaz-kus-v2';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './app.js',
  './style.css',
  './manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa döndür
        if (response) {
          return response;
        }
        
        // Yoksa internetten al
        return fetch(event.request).then(
          (response) => {
            // Geçerli yanıt değilse döndür
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Yanıtı cache'e ekle
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate - Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
