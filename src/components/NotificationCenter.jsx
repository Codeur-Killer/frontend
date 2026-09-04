import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoneIncoming, PackageX, X, BellRing } from 'lucide-react'
import { getToken } from '../api/httpClient'
import { playNotificationSound } from '../utils/notificationSound'
import { pushSupported, subscribeToPush } from '../utils/pushSubscription'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010/api'
const AUTO_DISMISS_MS = 12000

const kinds = {
  'demande.created': {
    icon: PhoneIncoming,
    title: 'Nouvelle expression de besoin',
    body: (e) => `${e.demandeurNom} · ${e.numero} · ${e.programmeNom}`,
    href: '/gestion/demandes',
  },
  'stock.depleted': {
    icon: PackageX,
    title: 'Rupture de stock',
    body: (e) => `${e.designation} n'a plus de stock disponible.`,
    href: '/gestion/alertes',
  },
}

export default function NotificationCenter() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const [showPrompt, setShowPrompt] = useState(
    () => pushSupported() && Notification.permission === 'default' && !sessionStorage.getItem('gugp_push_prompt_dismissed')
  )

  async function enablePush() {
    setShowPrompt(false)
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        await subscribeToPush()
      } catch (err) {
        console.error('Abonnement aux notifications push impossible :', err)
      }
    }
  }

  function dismissPrompt() {
    sessionStorage.setItem('gugp_push_prompt_dismissed', '1')
    setShowPrompt(false)
  }

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const source = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`)

    source.onmessage = (e) => {
      let event
      try {
        event = JSON.parse(e.data)
      } catch {
        return
      }
      if (!kinds[event.type]) return

      const id = nextId.current++
      setToasts((prev) => [...prev, { id, event }])
      playNotificationSound()
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), AUTO_DISMISS_MS)
    }

    return () => source.close()
  }, [])

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0 && !showPrompt) return null

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2.5">
      {showPrompt ? (
        <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 shadow-lg">
          <BellRing size={17} className="mt-0.5 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Activer les notifications ?</p>
            <p className="mt-0.5 text-xs text-muted">
              Recevez une alerte pour les nouvelles demandes et les ruptures de stock, même quand l'application est fermée.
            </p>
            <div className="mt-2 flex gap-3">
              <button onClick={enablePush} className="text-xs font-medium text-gold hover:text-gold-2">Activer</button>
              <button onClick={dismissPrompt} className="text-xs font-medium text-muted hover:text-ink">Plus tard</button>
            </div>
          </div>
        </div>
      ) : null}
      {toasts.map(({ id, event }) => {
        const kind = kinds[event.type]
        const Icon = kind.icon
        return (
          <div
            key={id}
            className="animate-notification-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-gold/40 bg-ink px-4 py-3.5 text-white shadow-xl"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
              <Icon size={17} className="relative text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{kind.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/70">{kind.body(event)}</p>
              <Link
                to={kind.href}
                onClick={() => dismiss(id)}
                className="mt-1.5 inline-block text-xs font-medium text-gold hover:text-gold-2"
              >
                Voir
              </Link>
            </div>
            <button onClick={() => dismiss(id)} className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Fermer">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
