// Service Worker for Civilization VI Turn Tracker PWA

const CACHE_NAME = 'civ-vi-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
  'https://img.icons8.com/color/96/000000/sid-meiers-civilization.png',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('fonts.googleapis.com') && 
      !event.request.url.includes('img.icons8.com') &&
      !event.request.url.includes('images.unsplash.com')) {
    return;
  }
  
  // Skip API requests (don't cache them)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// Push event - handle incoming notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update in your Civilization VI game!',
      icon: 'https://img.icons8.com/color/96/000000/sid-meiers-civilization.png',
      badge: 'https://img.icons8.com/color/96/000000/sid-meiers-civilization.png',
      tag: data.tag || 'civ-turn-notification',
      data: {
        gameId: data.gameId,
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Civilization VI Turn Tracker', 
        options
      )
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Notification click event - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const gameId = event.notification.data?.gameId;
  const urlToOpen = gameId 
    ? new URL(`/game/${gameId}`, self.location.origin).href
    : self.location.origin;
    
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // Check if there is already a window with the URL
      const matchingClient = windowClients.find((client) => {
        return client.url === urlToOpen;
      });
      
      if (matchingClient) {
        return matchingClient.focus();
      }
      
      // If no existing window, open a new one
      return clients.openWindow(urlToOpen);
    })
  );
});
