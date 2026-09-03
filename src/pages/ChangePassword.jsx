import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const homeByRole = {
  admin: '/admin/comptes',
  gestionnaire: '/gestion/tableau-de-bord',
  utilisateur: '/app/articles',
}

export default function ChangePassword() {
  const { currentUser, loading: sessionLoading, changePassword } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />

  const forced = currentUser.mustChangePassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }
    setLoading(true)
    try {
      const user = await changePassword(currentPassword, newPassword)
      navigate(homeByRole[user.role] || '/connexion', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        {!forced ? (
          <Link to={homeByRole[currentUser.role] || '/connexion'} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft size={15} /> Retour
          </Link>
        ) : null}

        <h1 className="text-xl font-semibold text-ink">Changer de mot de passe</h1>
        <p className="mt-1.5 text-sm text-muted">
          {forced
            ? 'Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.'
            : 'Choisissez un nouveau mot de passe pour votre compte.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Mot de passe actuel</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              autoComplete="current-password"
              required
              autoFocus
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-ink/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 pr-10 text-sm text-ink focus:border-ink/40"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-label={showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Confirmer le nouveau mot de passe</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-ink/40"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gold bg-gold px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={16} />
            {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
