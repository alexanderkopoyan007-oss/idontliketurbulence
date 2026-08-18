/* Ride Report — shell cache. Forecast data is never cached: a stale turbulence
   forecast is worse than no forecast, so network failures surface as errors. */
/* Bump on every change to index.html: the fetch handler is cache-first for
   same-origin requests, so a stale shell would otherwise be served forever. */
const SHELL = "ride-shell-098b4dcfb7f1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== SHELL).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // never serve forecast, geocoding or tile responses from cache
  if (/api\.open-meteo\.com|api\.adsbdb\.com|aviationweather\.gov/.test(u.hostname)) return;
  if (/basemaps\.cartocdn\.com/.test(u.hostname)) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && u.origin === location.origin) {
        const copy = res.clone(); caches.open(SHELL).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
