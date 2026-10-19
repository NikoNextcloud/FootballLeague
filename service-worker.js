// Cache ownership includes the deployment path: another app on this origin is untouched.
const CACHE_PREFIX = `a-grupa:${new URL(self.registration.scope).pathname}:`;
const CACHE = `${CACHE_PREFIX}shell-v28`;
const SCOPE = new URL(self.registration.scope);
const ASSETS = [
  "./", "index.html", "styles.css", "app.js", "football-data.js", "manifest.webmanifest",
  "data/bulgarian-football.json",
  "assets/logos/desktop-192.png", "assets/logos/desktop-512.png",
  "assets/logos/favicon-32.png", "assets/logos/logo.png",
  "assets/backgrounds/stadium.jpg"
].map(path => new URL(path, SCOPE).href);
const MAX_ENTRIES = 120;

self.addEventListener("install", event => {
  // Cache.addAll rejects non-2xx responses, so a broken deployment cannot replace the shell.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

function isInScope(url) {
  return url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
}

function isCacheableResource(url, request) {
  const relative = url.pathname.slice(SCOPE.pathname.length);
  return request.mode === "navigate" || ASSETS.includes(url.origin + url.pathname) ||
    /^data\/[^/]+\.json$/.test(relative) || relative.startsWith("assets/");
}

async function updateCache(cache, request, response) {
  // Never persist redirects, HTTP errors, or opaque third-party responses.
  if (!response.ok || response.redirected || response.type === "opaque") return;
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  const removable = keys.filter(key => !ASSETS.includes(key.url));
  for (const key of removable.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(key);
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || !isInScope(url) || !isCacheableResource(url, request)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // The app adds a cache-busting timestamp. Keep one offline copy per dataset,
    // while preserving meaningful query parameters such as a requested season.
    const cacheURL = new URL(url);
    if (cacheURL.pathname.endsWith(".json")) cacheURL.searchParams.delete("ts");
    else if (ASSETS.includes(cacheURL.origin + cacheURL.pathname)) cacheURL.search = "";
    const cacheKey = cacheURL.href;
    let response;
    try {
      // Football data must revalidate even when the browser HTTP cache has a fresh copy.
      response = await fetch(request, { cache: "no-cache" });
      if (response.ok) {
        event.waitUntil(updateCache(cache, cacheKey, response).catch(() => {}));
        return response;
      }
    } catch (_) { /* Offline: use the last successful response below. */ }
    const cached = await cache.match(cacheKey);
    if (cached) {
      if (cacheURL.pathname.endsWith(".json")) {
        const headers = new Headers(cached.headers);
        headers.set("X-Football-Cache", "offline");
        return new Response(await cached.blob(), {status: cached.status, statusText: cached.statusText, headers});
      }
      return cached;
    }
    if (request.mode === "navigate") {
      const shell = await cache.match(new URL("index.html", SCOPE).href);
      if (shell) return shell;
    }
    return response || new Response("Няма връзка с интернет. Опитайте отново след свързване.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const candidate = new URL(event.notification.data?.url || "./", SCOPE);
  const target = isInScope(candidate) ? candidate.href : SCOPE.href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async list => {
    const client = list.find(client => isInScope(new URL(client.url)) && "focus" in client);
    if (client) {
      if ("navigate" in client) await client.navigate(target);
      return client.focus();
    }
    return self.clients.openWindow(target);
  }));
});
