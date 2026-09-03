import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const homeByRole = {
  admin: '/admin/comptes',
  gestionnaire: '/gestion/tableau-de-bord',
  utilisateur: '/app/articles',
}

export default function Login() {
  const { currentUser, loading: sessionLoading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return null
  if (currentUser) {
    return <Navigate to={homeByRole[currentUser.role] || '/connexion'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(homeByRole[result.user.role] || '/connexion', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-[420px] shrink-0 flex-col justify-center gap-8 bg-ink px-10 py-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#F3F1EB" fillOpacity="0.1" />
            <path d="M18 20h16l12 12-16 16-12-12V20z" fill="none" stroke="#F3F1EB" strokeWidth="3.5" strokeLinejoin="round" />
            <circle cx="24" cy="26" r="2.8" fill="#D9A64E" />
          </svg>
          <span className="text-lg font-semibold">G-UGP</span>
        </div>

        <img src="/illustration-connexion.svg" alt="" className="w-full" />

        <p className="text-sm text-white/60">Gestion des stocks et expressions de besoins.</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-ink">Connexion</h1>
          <p className="mt-1.5 text-sm text-muted">
            Connectez-vous avec les identifiants fournis par votre administrateur.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Adresse e-mail</label>
              <input
                type="email"
                autoComplete="username"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@ugp-boad.tg"
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-line bg-surface px-3 py-2.5 pr-10 text-sm text-ink placeholder:text-muted focus:border-ink/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gold bg-gold px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={16} />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
