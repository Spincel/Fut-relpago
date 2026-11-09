/* Service worker del Torneo Relámpago (PWA manual, sin dependencias extra).
 * Estrategia:
 * - App shell (/, /index.html, manifest e iconos): cache-first, con
 *   actualización en segundo plano.
 * - Navegación: network-first con fallback a /index.html desde caché
 *   (para que la app instalada abra sin conexión).
 * - Otros recursos mismo origen (JS/CSS/imágenes): stale-while-revalidate.
 * - Nunca se interceptan: peticiones a otros orígenes ni /api/*.
 * Versión del caché: cambiar CACHE_NAME al publicar cambios del shell.
 */
const CACHE_NAME = 'torneo-relampago-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {
        /* Si algún recurso del shell falla, la instalación sigue;
           se cacheará bajo demanda en los fetch. */
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // No tocar otros orígenes ni las rutas de la API del servidor.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Navegación: red primero, caché como respaldo.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // Recursos estáticos: caché primero, red en segundo plano.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
