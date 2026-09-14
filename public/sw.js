// ensage service worker — makes the app installable and usable offline.
// Deliberately conservative: it never caches API responses, auth pages or
// per-user HTML. Only stable public assets and the offline fallback are stored.
const CACHE = "ensage-static-v1"

const PRECACHE = [
  "/offline",
  "/manifest.webmanifest",
  "/pwa-192.png",
  "/pwa-512.png",
  "/pwa-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
      await self.skipWaiting()
    })()
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting()
})

const STATIC_ASSET = /\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf)$/i

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return
  if (url.pathname === "/sw.js") return
  if (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up")) {
    return
  }

  // Navigations stay online-first; only fall back to the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch {
          const cache = await caches.open(CACHE)
          return (
            (await cache.match("/offline")) ||
            new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          )
        }
      })()
    )
    return
  }

  // Hashed build assets and public media: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    STATIC_ASSET.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE)
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok && response.type === "basic") {
          cache.put(request, response.clone())
        }
        return response
      })()
    )
  }
})
