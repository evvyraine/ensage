"use client"

import { useEffect } from "react"

/**
 * Registers the offline service worker in production only — a service worker in
 * development fights with HMR and makes stale builds hard to reason about.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Best effort — the app works fine without a service worker.
      })
    }

    if (document.readyState === "complete") {
      register()
      return
    }

    window.addEventListener("load", register)
    return () => window.removeEventListener("load", register)
  }, [])

  return null
}
