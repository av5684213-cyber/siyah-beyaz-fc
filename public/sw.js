// ═══════════════════════════════════════════════════════════════
// Touchline Manager — Service Worker (Web Push Bildirimleri + Offline Cache)
// ═══════════════════════════════════════════════════════════════

/// <reference lib="webworker" />

const SW_VERSION = '2.1.0';
const CACHE_NAME = 'sbfc-cache-v2.1';

// Statik asset'ler — install sırasında önbelleğe al
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/badge-72.png',
  '/badge-96.png',
  '/badge-128.png',
  '/badge-144.png',
  '/badge-192.png',
  '/badge-512.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Statik asset uzantıları — cache'lenecek
const CACHEABLE_EXTENSIONS = ['.js', '.css', '.png', '.svg', '.woff2', '.woff', '.ttf', '.ico', '.json'];

// Install — precache statik asset'ler
self.addEventListener('install', (event) => {
  console.log('[SW] Yüklendi v' + SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching statik asset\'ler');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache hatası (bazı dosyalar ulaşılamaz olabilir):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — eski cache'leri temizle
self.addEventListener('activate', (event) => {
  console.log('[SW] Aktif v' + SW_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Eski cache siliniyor:', name);
            return caches.delete(name);
          })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// ── Fetch: Network-first, Cache-fallback stratejisi ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API isteklerini önbelleğe alma (dinamik veriler)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Sadece GET isteklerini önbelleğe al
  if (request.method !== 'GET') {
    return;
  }

  // Chrome extension isteklerini yoksay
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Statik asset mi kontrol et
  const isStaticAsset = CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
  // Next.js chunk'ları da statik
  const isNextStatic = url.pathname.startsWith('/_next/static/');

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Başarılı yanıtı önbelleğe kaydet ve döndür
        if (networkResponse && networkResponse.status === 200) {
          // Statik asset'leri ve Next.js chunk'larını cache'le
          if (isStaticAsset || isNextStatic) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
        }
        return networkResponse;
      })
      .catch(() => {
        // Network başarısız — cache'den dene
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // HTML sayfaları için offline fallback — ana sayfayı döndür
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Push bildirim alma
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Touchline Manager';
    const options: NotificationOptions = {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/fixture',
      },
      actions: [
        { action: 'open', title: 'Maçı Görüntüle' },
        { action: 'dismiss', title: 'Kapat' },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[SW] Push işleme hatası:', err);
  }
});

// Bildirime tıklama
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/fixture';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Açık pencere varsa odaklan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Yoksa yeni pencere aç
      return self.clients.openWindow(urlToOpen);
    })
  );
});
