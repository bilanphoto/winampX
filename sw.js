/**
 * Winamp & Walkman Retro Player - Offline-First Service Worker
 * Pre-caches all HTML, CSS, JS, cassette assets, and classic skins on the first visit
 * so the player opens and plays music 100% offline without an internet connection.
 */

const CACHE_NAME = 'winamp-walkman-offline-v3.4';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './styles.css?v=3.4',
  './app.js',
  './app.js?v=3.4',
  './audio-engine.js',
  './audio-engine.js?v=3.4',
  './db.js',
  './id3.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Cassette Tape Assets (All 7 Colors + Spinning Reel Spool)
  './assets/cassette/cassette-reel-spool.png',
  './assets/cassette/tape-clear-clean.png',
  './assets/cassette/tape-orange-clean.png',
  './assets/cassette/tape-red-clean.png',
  './assets/cassette/tape-green-clean.png',
  './assets/cassette/tape-blue-clean.png',
  './assets/cassette/tape-yellow-clean.png',
  './assets/cassette/tape-pink-clean.png',
  // Classic Winamp 2.91 Skin Sprites
  './skin/classic/MAIN.png',
  './skin/classic/TITLEBAR.png',
  './skin/classic/PLAYPAUS.png',
  './skin/classic/NUMBERS.png',
  './skin/classic/MONOSTER.png',
  './skin/classic/VOLUME.png',
  './skin/classic/BALANCE.png',
  './skin/classic/SHUFREP.png',
  './skin/classic/POSBAR.png',
  './skin/classic/CBUTTONS.png',
  './skin/classic/EQMAIN.png',
  './skin/classic/EQ_EX.png',
  './skin/classic/PLEDIT.png',
  './skin/classic/TEXT.png',
  './skin/classic/GEN.png',
  './skin/classic/GENEX.png',
  './skin/classic/MB.png',
  './skin/classic/VIDEO.png'
];

// 1. Install Event: Pre-cache all core assets and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache each asset individually so one optional failure doesn't block the whole install
      const promises = PRECACHE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'reload' });
          if (response && response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn('[SW] Pre-cache skipped for:', url, err);
        }
      });
      await Promise.all(promises);
    })
  );
});

// 2. Activate Event: Clean up old caches and claim all open clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Offline-First (Cache-First with background update & ignoreSearch fallback)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests over http/https (let YouTube / external APIs pass through directly)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }
  const reqUrl = new URL(request.url);
  if (reqUrl.origin !== self.location.origin) {
    return;
  }

  // Handle Page Navigation (opening the GitHub link directly)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        // Try serving cached index.html immediately for instant offline load,
        // while also updating cache in background if online
        const cachedPage = (await cache.match('./index.html')) || (await cache.match('./')) || (await cache.match(request, { ignoreSearch: true }));

        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put('./index.html', networkResponse.clone());
              cache.put('./', networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedPage) {
          // Trigger background update without blocking offline startup
          event.waitUntil(networkFetch);
          return cachedPage;
        }

        const freshPage = await networkFetch;
        if (freshPage) return freshPage;

        return new Response('Offline - Please connect to the internet once to initialize the player.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // Handle Static Assets (CSS, JS, PNGs, Fonts)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Match exact URL first, then fallback to ignoreSearch (strips ?v=3.x query params)
      let cachedResponse = await cache.match(request);
      if (!cachedResponse) {
        cachedResponse = await cache.match(request, { ignoreSearch: true });
      }

      const fetchAndCache = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        // Return cached asset immediately (0ms offline), update in background
        event.waitUntil(fetchAndCache);
        return cachedResponse;
      }

      // If not in cache yet, wait for network and cache it
      const networkResponse = await fetchAndCache;
      if (networkResponse) {
        return networkResponse;
      }

      return new Response('', { status: 404, statusText: 'Offline asset not found' });
    })()
  );
});
