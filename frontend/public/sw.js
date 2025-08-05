// Service Worker for CityPulse Hechingen PWA
// Provides offline functionality, caching, and performance optimization

const CACHE_NAME = 'citypulse-hechingen-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const API_CACHE = `${CACHE_NAME}-api`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/hechingen-icon.svg',
  // Critical CSS and JS will be added dynamically
];

// API endpoints to cache
const CACHEABLE_API_PATTERNS = [
  /\/api\/energy\/historical/,
  /\/api\/buildings\/\w+\/overview/,
  /\/api\/kpi\/summary/,
  /\/api\/analytics\/\w+/
];

// Dynamic import patterns - handle module loading
const DYNAMIC_IMPORT_PATTERNS = [
  /\/assets\/js\//,
  /\/assets\/css\//,
  /\/assets\/images\//,
  /\.js$/,
  /\.mjs$/,
  /\.css$/
];

// Initialize service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('citypulse-hechingen-') && 
                !cacheName.includes('v1.0.0')) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Determine caching strategy based on request type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  
  if (isStaticAsset(request)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (isImage(request)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  } else if (isAPI(request)) {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  } else if (isDynamicImport(request)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Handle requests based on strategy
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request);
  
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName);
      
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
      
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await caches.match(request);
      
      default:
        return await networkFirst(request, cacheName);
    }
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    return handleFallback(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network-first strategy with module handling
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    // Check for HTML responses to JS requests (404 fallback issue)
    if (request.url.includes('.js') && 
        networkResponse.headers.get('content-type')?.includes('text/html')) {
      console.warn('Service Worker: JS request returned HTML, likely 404:', request.url);
      // Try cache or skip caching this response
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // Don't cache HTML responses for JS files
      return networkResponse;
    }
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for background updates
  });
  
  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Handle fallback responses
async function handleFallback(request) {
  const url = new URL(request.url);
  
  // HTML pages - return offline page
  if (request.destination === 'document') {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/offline.html') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // Images - return placeholder
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="75" text-anchor="middle" fill="#ccc">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // API calls - return empty response or cached data
  if (url.pathname.startsWith('/api/')) {
    return new Response('{"error": "Offline", "data": null}', {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
  
  return new Response('Not available offline', { status: 503 });
}

// Utility functions
function getCacheName(request) {
  if (isImage(request)) return IMAGE_CACHE;
  if (isAPI(request)) return API_CACHE;
  if (isStaticAsset(request)) return STATIC_CACHE;
  return DYNAMIC_CACHE;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname === '/' || 
         url.pathname.endsWith('.html') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.json');
}

function isImage(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

function isAPI(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isDynamicImport(request) {
  return DYNAMIC_IMPORT_PATTERNS.some(pattern => pattern.test(request.url));
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'energy-data-sync') {
    event.waitUntil(syncEnergyData());
  }
});

async function syncEnergyData() {
  try {
    // Sync any queued energy data when back online
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    // Re-fetch recent API data
    const energyRequests = requests.filter(req => 
      req.url.includes('/api/energy/') && 
      isRecent(req.url)
    );
    
    for (const request of energyRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.warn('Failed to sync:', request.url, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function isRecent(url) {
  // Check if the URL contains recent timestamps
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // This is a simplified check - in practice, parse URL parameters
  return true; // For now, sync all energy data
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    title: data.title || 'CityPulse Hechingen',
    body: data.body || 'New energy data available',
    icon: '/hechingen-icon.svg',
    badge: '/hechingen-icon.svg',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: data.priority === 'high',
    silent: data.priority === 'low'
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(data.cacheName));
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      }));
      break;
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return Promise.all(
    urls.map(url => 
      fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
      }).catch(() => {
        // Ignore failed caches
      })
    )
  );
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0
};

function recordMetric(metric) {
  performanceMetrics[metric]++;
  
  // Send metrics to main thread periodically
  if (performanceMetrics.networkRequests % 50 === 0) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_METRICS',
          metrics: { ...performanceMetrics }
        });
      });
    });
  }
}

console.log('Service Worker: Loaded successfully');