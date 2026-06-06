// Service worker for 3D Print Cost PWA
// Cache-first for static assets, network-first for HTML pages

const CACHE_NAME = "print-cost-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/"])
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests; skip API routes
  if (
    url.origin !== self.location.origin ||
    request.method !== "GET" ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Network-first for HTML pages — falls back to cached shell when offline.
  // Only cache successful, non-redirected responses.
  if (request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
