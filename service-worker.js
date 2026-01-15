self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("tyre-cache").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./app.js",
        "./tyres.json"
      ])
    )
  );
});
