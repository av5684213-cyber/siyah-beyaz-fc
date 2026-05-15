// ─── Siyah Beyaz FC — Service Worker ──────────────────────────────────
// Push bildirimleri ve offline destek

const CACHE_NAME = 'sbfc-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.png',
  '/icon-72x72.png',
];

// Install event - statik dosyaları önbelleğe al
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - eski önbellekleri temizle
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - ağ öncelikli, önbellek fallback
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push event - bildirim göster
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {
    title: 'Siyah Beyaz FC',
    body: 'Yeni bildirim',
    url: '/',
  };

  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-72x72.png',
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Siyah Beyaz FC', options)
  );
});

// Notification click event - URL'ye yönlendir
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Açık pencere varsa o pencereye odaklan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Yoksa yeni pencere aç
      return self.clients.openWindow(url);
    })
  );
});
