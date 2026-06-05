// Version control - increment when updating assets
const APP_VERSION = '1.0.3';
const CACHE_NAME = `tapioca-v${APP_VERSION.replace(/\./g, '-')}`;
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './src/constants/config.js',
    './src/data/menuData.js',
    './src/utils/toast.js',
    './src/utils/helpers.js',
    './src/modules/ui.js',
    './src/modules/cart.js',
    './src/modules/menu.js',
    './src/modules/checkout.js',
    './src/modules/sw-client.js',
    './manifest.json',
    './offline.html',
    './assets/icons/icon-192.svg',
    './assets/icons/icon-512.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

// A small runtime cache for images
const RUNTIME_IMAGE_CACHE = 'tapioca-images-v1';
const MAX_IMAGE_CACHE_SIZE = 50; // Maximum number of images to cache

// Install Service Worker and precache essential assets
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing Service Worker v${APP_VERSION}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log(`[SW] Precaching ${PRECACHE_ASSETS.length} assets`);
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Precaching completed successfully');
            })
            .catch((error) => {
                console.error('[SW] Precaching failed:', error);
                // Don't fail installation if some assets fail to cache
            })
    );
    self.skipWaiting();
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating Service Worker v${APP_VERSION}`);
    event.waitUntil(
        caches.keys().then((keys) => {
            const deletePromises = keys
                .filter((key) => key !== CACHE_NAME && key !== RUNTIME_IMAGE_CACHE)
                .map((key) => {
                    console.log(`[SW] Deleting old cache: ${key}`);
                    return caches.delete(key);
                });
            
            if (deletePromises.length > 0) {
                console.log(`[SW] Cleaning up ${deletePromises.length} old cache(s)`);
            } else {
                console.log('[SW] No old caches to clean up');
            }
            
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log('[SW] Activation completed');
        })
        .catch((error) => {
            console.error('[SW] Activation failed:', error);
        })
    );
    self.clients.claim();
});

// Helper: respond with network-first for navigation requests
async function handleNavigationRequest(event) {
    try {
        const networkResponse = await fetch(event.request);
        // clone synchronously before any async operations
        const responseToCache = networkResponse.clone();
        // update the cache with the latest HTML
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, responseToCache).catch(() => {});
        return networkResponse;
    } catch (err) {
        // Network failed — try cache then offline fallback
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return await caches.match('./offline.html') || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

// Trim cache helper to keep runtime caches bounded
async function trimCache(cacheName, maxItems) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        if (keys.length > maxItems) {
            const deleteCount = keys.length - maxItems;
            console.log(`[SW] Trimming ${cacheName}: removing ${deleteCount} old entries`);
            for (let i = 0; i < deleteCount; i++) {
                await cache.delete(keys[i]);
            }
        }
    } catch (e) {
        console.warn(`[SW] Cache trim failed for ${cacheName}:`, e);
    }
}

// Fetch handler: network-first for navigations, cache-first for images, stale-while-revalidate for other assets
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Ignore non-GET requests
    if (request.method !== 'GET') return;

    // Navigation requests (HTML pages) — network first
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(event));
        return;
    }

    const url = new URL(request.url);

    // Dynamic cache for external APIs (like Google Fonts or Unsplash)
    const isExternalAPI = url.hostname.includes('fonts.googleapis.com') || 
                          url.hostname.includes('fonts.gstatic.com') ||
                          url.hostname.includes('unsplash.com');

    // Images: cache-first with runtime cache
    if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname) || isExternalAPI) {
        event.respondWith(
            caches.open(RUNTIME_IMAGE_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;
                try {
                    const response = await fetch(request);
                    const responseToCache = response.clone();
                    // put a copy in the runtime cache
                    cache.put(request, responseToCache).catch((err) => {
                        console.warn('[SW] Failed to cache resource:', request.url, err);
                    });
                    // keep cache bounded (do not await to speed response)
                    trimCache(RUNTIME_IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE).catch(() => {});
                    return response;
                } catch (err) {
                    // fallback to precached offline page or a response object when images fail
                    return await caches.match('./offline.html') || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                }
            })
        );
        return;
    }

    // CSS/JS/fonts/etc — stale-while-revalidate: return cache if present, also fetch update
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                // clone synchronously before any async operations
                const responseToCache = networkResponse.clone();
                // update cache
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                return networkResponse;
            }).catch(() => caches.match('./offline.html'));
            // prefer cached response if available, otherwise network
            return cached || fetchPromise;
        })
    );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    
    let data = {
        title: 'Tapioca do Lula',
        body: 'Sua tapioca está saindo do fogo!',
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver meu pedido',
                icon: './assets/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: './assets/icons/icon-192.png'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else {
        // Default action: focus the window if open, otherwise open new
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});
