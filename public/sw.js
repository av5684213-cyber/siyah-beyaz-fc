// ═══════════════════════════════════════════════════════════════
// Service Worker — Web Push Bildirimleri
// public/sw.js
// ═══════════════════════════════════════════════════════════════

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Push event — bildirim göster
self.addEventListener('push', (event: PushEvent) => {
  let data: { title?: string; body?: string; icon?: string; url?: string } = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    data = {
      title: 'Siyah Beyaz FC',
      body: 'Yeni bildiriminiz var!',
    };
  }

  const title = data.title || 'Siyah Beyaz FC';
  const body = data.body || '';
  const icon = data.icon || '/favicon.ico';
  const url = data.url || '/';

  const options: NotificationOptions = {
    body,
    icon,
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: { url },
    actions: [
      { action: 'open', title: 'Aç' },
      { action: 'dismiss', title: 'Kapat' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click — URL'ye yönlendir
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(url)
    );
  }
});

// Install & Activate
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

export {};
