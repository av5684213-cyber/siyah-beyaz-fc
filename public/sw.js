// ═══════════════════════════════════════════════════════════════
// Siyah Beyaz FC — Service Worker (Web Push Bildirimleri)
// ═══════════════════════════════════════════════════════════════

/// <reference lib="webworker" />

const SW_VERSION = '1.0.0';

// Install
self.addEventListener('install', (event) => {
  console.log('[SW] Yüklendi v' + SW_VERSION);
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Aktif v' + SW_VERSION);
  event.waitUntil(self.clients.claim());
});

// Push bildirim alma
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Siyah Beyaz FC';
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
