import { useMemo, useState } from 'react'
import { Search, Plus, Pencil, PowerOff, Power, KeyRound, UserCog, Mail, TriangleAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { roleConfig, userStatusConfig } from '../../utils/status'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const roles = [
  { value: 'utilisateur', label: 'Utilisateur' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'admin', label: 'Administrateur' },
]

const emptyForm = { nom: '', email: '', poste: '', role: 'utilisateur', programmeIds: [] }

export default function Comptes() {
  const { currentUser } = useAuth()
  const { users, programmes, findProgramme, addUser, updateUser, setUserActive, resetPassword } = useAppData()

  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Tous les rôles')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const [resetTarget, setResetTarget] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [credentialsInfo, setCredentialsInfo] = useState(null)

  const filtres = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        !query ||
        u.nom.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      const matchRole = role === 'Tous les rôles' || u.role === role
      return matchQuery && matchRole
    })
  }, [users, query, role])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(user) {
    setEditing(user)
    setForm({
      nom: user.nom,
      email: user.email,
      poste: user.poste,
      role: user.role,
      programmeIds: user.programmeIds || [],
    })
    setFormError('')
    setModalOpen(true)
  }

  function toggleProgramme(id) {
    setForm((f) => ({
      ...f,
      programmeIds: f.programmeIds.includes(id) ? f.programmeIds.filter((p) => p !== id) : [...f.programmeIds, id],
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editing?.id
    )
    if (emailTaken) {
      setFormError('Cette adresse e-mail est déjà utilisée par un autre compte.')
      return
    }
    try {
      if (editing) {
        await updateUser(editing.id, {
          nom: form.nom,
          email: form.email.trim(),
          poste: form.poste,
          role: form.role,
          programmeIds: form.role === 'admin' ? [] : form.programmeIds,
        })
      } else {
        const created = await addUser({
          nom: form.nom,
          email: form.email.trim(),
          poste: form.poste,
          role: form.role,
          programmeIds: form.role === 'admin' ? [] : form.programmeIds,
        })
        setCredentialsInfo({ email: created.email, temporaryPassword: created.temporaryPassword })
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function handleToggleActive(user) {
    if (user.id === currentUser.id) return
    await setUserActive(user.id, !user.actif)
  }

  function openReset(user) {
    setResetTarget(user)
  }

  async function confirmReset() {
    setResetLoading(true)
    try {
      const result = await resetPassword(resetTarget.id)
      setCredentialsInfo({ email: resetTarget.email, temporaryPassword: result.temporaryPassword })
      setResetTarget(null)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Comptes utilisateurs"
        description="Créez les comptes, attribuez les rôles et gérez l'accès à l'application."
        actions={
          <Button variant="gold" icon={Plus} onClick={openCreate}>
            Nouveau compte
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou e-mail"
            className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-ink/40"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40">
          <option>Tous les rôles</option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={UserCog} title="Aucun compte ne correspond" description="Modifiez les filtres ou créez un nouveau compte." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Nom</th>
                <th className="px-4 py-2.5 font-medium">E-mail</th>
                <th className="px-4 py-2.5 font-medium">Poste</th>
                <th className="px-4 py-2.5 font-medium">Programme(s)</th>
                <th className="px-4 py-2.5 font-medium">Rôle</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-2.5 font-medium text-ink">{u.nom}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink">{u.poste}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {u.role === 'admin'
                      ? 'Tous'
                      : (u.programmeIds || []).map((id) => findProgramme(id)?.nom).filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill config={roleConfig[u.role]} size="sm" />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill config={userStatusConfig[String(u.actif)]} size="sm" />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink" aria-label="Modifier">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => openReset(u)} className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink" aria-label="Réinitialiser le mot de passe" title="Réinitialiser le mot de passe">
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={u.id === currentUser.id}
                        className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={u.actif ? 'Désactiver' : 'Activer'}
                        title={u.id === currentUser.id ? 'Impossible de désactiver votre propre compte' : u.actif ? 'Désactiver' : 'Activer'}
                      >
                        {u.actif ? <PowerOff size={15} /> : <Power size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le compte' : 'Nouveau compte'}>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs text-muted">Nom complet</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Adresse e-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Poste</label>
            <input
              required
              value={form.poste}
              onChange={(e) => setForm({ ...form, poste: e.target.value })}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Rôle</label>
            <select
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {form.role !== 'admin' ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Programme(s)</label>
              {programmes.length === 0 ? (
                <p className="text-sm text-muted">Aucun programme n'existe encore. Créez-en un d'abord dans Programmes.</p>
              ) : (
                <div className="space-y-1.5 rounded-md border border-line bg-surface px-3 py-2.5">
                  {programmes.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={form.programmeIds.includes(p.id)}
                        onChange={() => toggleProgramme(p.id)}
                        className="rounded border-line"
                      />
                      {p.nom}
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-muted">
                Seuls les programmes cochés seront accessibles à ce compte (articles, stock et expressions de besoin).
              </p>
            </div>
          ) : null}
          {!editing ? (
            <p className="flex items-start gap-1.5 text-xs text-muted">
              <Mail size={14} className="mt-0.5 shrink-0" />
              Un mot de passe temporaire sera généré et envoyé par e-mail à cette adresse.
            </p>
          ) : null}
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="gold">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Réinitialiser le mot de passe">
        <p className="text-sm text-muted">
          Un nouveau mot de passe temporaire sera généré et envoyé par e-mail à{' '}
          <span className="font-medium text-ink">{resetTarget?.nom}</span> ({resetTarget?.email}).
          Il devra le changer dès sa prochaine connexion.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetTarget(null)}>Annuler</Button>
          <Button variant="gold" disabled={resetLoading} onClick={confirmReset}>
            {resetLoading ? 'Envoi...' : 'Réinitialiser'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!credentialsInfo} onClose={() => setCredentialsInfo(null)} title={credentialsInfo?.temporaryPassword ? 'E-mail non envoyé' : 'E-mail envoyé'}>
        {credentialsInfo?.temporaryPassword ? (
          <div className="space-y-3">
            <p className="flex items-start gap-1.5 text-sm text-danger">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              L'envoi d'e-mail n'est pas configuré sur ce serveur. Communiquez ce mot de passe temporaire vous-même
              à <span className="font-medium">{credentialsInfo.email}</span> :
            </p>
            <p className="rounded-md border border-line bg-paper px-3 py-2 text-center font-mono text-sm text-ink">
              {credentialsInfo.temporaryPassword}
            </p>
          </div>
        ) : (
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <Mail size={15} className="mt-0.5 shrink-0" />
            Un e-mail avec les identifiants de connexion a été envoyé à{' '}
            <span className="font-medium text-ink">{credentialsInfo?.email}</span>.
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="gold" onClick={() => setCredentialsInfo(null)}>Fermer</Button>
        </div>
      </Modal>
    </div>
  )
}
