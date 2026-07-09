const CACHE="a-grupa-shell-v16";
const ASSETS=["./","index.html","styles.css","app.js","manifest.webmanifest","assets/logos/desktop-192.png","assets/logos/desktop-512.png","assets/logos/favicon-32.png","assets/logos/logo.png","assets/backgrounds/stadium.jpg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{if(e.request.url.includes("thesportsdb.com"))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const client of list){if("focus" in client)return client.focus()}return clients.openWindow(e.notification.data?.url||"./")}))});
