const CACHE = "a-grupa-shell-v27";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "data/bulgarian-football.json",
  "assets/logos/desktop-192.png",
  "assets/logos/desktop-512.png",
  "assets/logos/favicon-32.png",
  "assets/logos/logo.png",
  "assets/backgrounds/stadium.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || event.request.url.includes("thesportsdb.com")) return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) if ("focus" in client) return client.focus();
      return clients.openWindow(event.notification.data?.url || "./");
    })
  );
});
