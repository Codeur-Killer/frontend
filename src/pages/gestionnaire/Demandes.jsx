import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, Check, X } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

const filters = [
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuvee', label: 'Approuvées' },
  { key: 'rejetee', label: 'Rejetées' },
  { key: 'toutes', label: 'Toutes' },
]

const filterKeys = filters.map((f) => f.key)

export default function Demandes() {
  const { demandes, findUser, findArticle, approuverDemande, rejeterDemande } = useAppData()
  const [searchParams] = useSearchParams()
  const statutParam = searchParams.get('statut')
  const [filter, setFilter] = useState(filterKeys.includes(statutParam) ? statutParam : 'en_attente')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [motifRejet, setMotifRejet] = useState('')

  const sorted = [...demandes].sort((a, b) => (a.date < b.date ? 1 : -1))
  const visible = filter === 'toutes' ? sorted : sorted.filter((d) => d.statut === filter)

  async function handleApprove(id) {
    await approuverDemande(id)
  }

  async function confirmReject() {
    if (!motifRejet.trim()) return
    await rejeterDemande(rejectTarget.id, motifRejet.trim())
    setRejectTarget(null)
    setMotifRejet('')
  }

  return (
    <div>
      <PageHeader title="Demandes à traiter" description="Approuvez ou rejetez les expressions de besoin soumises par les utilisateurs." />

      <div className="mb-4 flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-ink text-white' : 'text-muted hover:bg-paper-2'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Rien à traiter ici" description="Les demandes correspondant à ce filtre apparaîtront dans cette liste." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Numéro</th>
                  <th className="px-4 py-2.5 font-medium">Demandeur</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Articles</th>
                  <th className="px-4 py-2.5 font-medium">Statut</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => {
                  const demandeur = findUser(d.demandeurId)
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">{d.numero}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-ink">{demandeur?.nom}</p>
                        <p className="text-xs text-muted">{demandeur?.poste}</p>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{formatDate(d.date)}</td>
                      <td className="px-4 py-2.5 text-muted">
                        {d.lignes.map((l) => findArticle(l.articleId)?.designation).filter(Boolean).join(', ')}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusPill config={demandeStatusConfig[d.statut]} size="sm" />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.statut === 'en_attente' ? (
                            <>
                              <button
                                onClick={() => handleApprove(d.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-ok/30 px-2 py-1 text-xs font-medium text-ok hover:bg-ok-bg"
                              >
                                <Check size={13} /> Approuver
                              </button>
                              <button
                                onClick={() => setRejectTarget(d)}
                                className="inline-flex items-center gap-1 rounded-md border border-danger/30 px-2 py-1 text-xs font-medium text-danger hover:bg-danger-bg"
                              >
                                <X size={13} /> Rejeter
                              </button>
                            </>
                          ) : null}
                          <Link to={`/gestion/demandes/${d.id}`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink hover:text-gold">
                            Détail <ChevronRight size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Rejeter ${rejectTarget?.numero || ''}`}>
        <p className="mb-3 text-sm text-muted">Précisez le motif du rejet. Il sera visible par le demandeur.</p>
        <textarea
          autoFocus
          rows={3}
          value={motifRejet}
          onChange={(e) => setMotifRejet(e.target.value)}
          placeholder="Ex. quantité demandée supérieure au stock disponible"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectTarget(null)}>Annuler</Button>
          <Button variant="danger" disabled={!motifRejet.trim()} onClick={confirmReject}>Confirmer le rejet</Button>
        </div>
      </Modal>
    </div>
  )
}
