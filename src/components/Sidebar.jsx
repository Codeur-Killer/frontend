import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, KeyRound, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ items, roleLabel }) {
  const { currentUser, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-lg hover:bg-gold-2"
        aria-label="Ouvrir le menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`no-print fixed lg:relative z-50 flex h-screen w-64 shrink-0 flex-col bg-ink text-white/90 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-2.5 px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14" fill="#F3F1EB" fillOpacity="0.1" />
              <path d="M18 20h16l12 12-16 16-12-12V20z" fill="none" stroke="#F3F1EB" strokeWidth="3.5" strokeLinejoin="round" />
              <circle cx="24" cy="26" r="2.8" fill="#D9A64E" />
            </svg>
            <div>
              <p className="text-[0.95rem] font-semibold leading-none text-white">G-UGP</p>
              <p className="mt-1 text-xs leading-none text-white/50">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {items.map(({ to, label, icon: Icon, badge, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {label}
              </span>
              {badge ? (
                <span className="rounded-full bg-gold px-1.5 py-0.5 text-[0.7rem] font-semibold leading-none text-white">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                {currentUser.nom.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{currentUser.nom}</p>
                <p className="truncate text-xs text-white/50">{currentUser.poste}</p>
              </div>
              <NavLink
                to="/mot-de-passe"
                onClick={() => setIsOpen(false)}
                title="Changer le mot de passe"
                className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <KeyRound size={16} />
              </NavLink>
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                title="Se déconnecter"
                className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
