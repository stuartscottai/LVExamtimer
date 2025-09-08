self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("exam-timer-cache").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js"
        // add any extra files your app needs offline, like sound files
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
