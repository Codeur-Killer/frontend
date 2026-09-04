import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'

precacheAndRoute(self.__WB_MANIFEST)

// Repli SPA : toute navigation (hors /api) reçoit index.html, pour que les
// routes React Router fonctionnent en accès direct / rafraîchissement.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), {
  denylist: [/^\/api\//],
}))

self.skipWaiting()
clientsClaim()

// Notifications push (créées par un gestionnaire connecté sur un autre
// poste, ou pour ce même poste quand l'onglet est fermé) — le direct SSE
// géré par NotificationCenter.jsx ne fonctionne, lui, que si l'onglet est
// ouvert.
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try {
    data = event.data.json()
  } catch {
    return
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
