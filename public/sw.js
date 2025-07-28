const CACHE_NAME = 'beyblade-tracker-v1.1.0';
const STATIC_CACHE_URLS = [
    '/',
    '/collection',
    '/combos',
    '/tournaments',
    '/testing',
    '/manifest.json',
    // Add critical CSS and JS files
    '/_next/static/css/app/layout.css',
    '/_next/static/chunks/webpack.js',
    '/_next/static/chunks/main.js',
    // Add critical images
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const DYNAMIC_CACHE_URLS = [
    // Part images
    '/images/parts/blades/',
    '/images/parts/bits/',
    '/images/parts/ratchets/',
    '/images/parts/assist_blades/',
    // API routes
    '/api/'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static files', error);
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Received SKIP_WAITING message');
        self.skipWaiting();
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated');

            // Notify all clients that the service worker has been updated
            return self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        message: 'Service Worker has been updated'
                    });
                });
            });
        }).then(() => {
            return self.clients.claim(); // Take control of all pages
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }

                // Fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Check if URL should be dynamically cached
                        const shouldCache = DYNAMIC_CACHE_URLS.some(pattern =>
                            request.url.includes(pattern)
                        ) || STATIC_CACHE_URLS.includes(url.pathname);

                        if (shouldCache) {
                            // Clone the response before caching
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('Service Worker: Caching new resource', request.url);
                                    cache.put(request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', request.url, error);

                        // Return offline fallback for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/') || new Response(
                                '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        }

                        throw error;
                    });
            })
    );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(
            // Sync any pending data when online
            syncPendingData()
        );
    }
});

// Push notifications (for future tournament reminders)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Tournament',
                    icon: '/icons/tournaments-shortcut.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icons/close.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Beyblade Tracker', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/tournaments')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to sync pending data
async function syncPendingData() {
    try {
        // Check for any pending data in IndexedDB/localStorage
        // and sync with Supabase when online
        console.log('Service Worker: Syncing pending data...');

        // This would implement actual sync logic based on your app's needs
        // For now, just log that sync was attempted

        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Failed to sync pending data', error);
        throw error;
    }
}
