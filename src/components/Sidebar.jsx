import { NavLink } from 'react-router-dom'
import { LogOut, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ items, roleLabel }) {
  const { currentUser, logout } = useAuth()

  return (
    <aside className="no-print flex h-screen w-64 shrink-0 flex-col bg-ink text-white/90">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
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

      <nav className="flex-1 space-y-0.5 px-3">
        {items.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
              title="Changer le mot de passe"
              className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <KeyRound size={16} />
            </NavLink>
            <button
              onClick={logout}
              title="Se déconnecter"
              className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
