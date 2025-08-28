// Service Worker for FluxiaBiz PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated!');
});

// Use appropriate fetch event type
self.addEventListener('fetch', (event) => {
  // Cache first strategy can be implemented here
  console.log('Fetching:', event.request.url);
});