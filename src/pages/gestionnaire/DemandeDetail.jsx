import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X, FileCheck2, MessageSquareWarning } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

export default function DemandeDetail() {
  const { id } = useParams()
  const { demandes, findUser, findArticle, approuverDemande, rejeterDemande } = useAppData()
  const navigate = useNavigate()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')

  const demande = demandes.find((d) => d.id === id)
  if (!demande) return <Navigate to="/gestion/demandes" replace />

  const demandeur = findUser(demande.demandeurId)

  async function handleApprove() {
    await approuverDemande(demande.id)
  }

  async function confirmReject() {
    if (!motifRejet.trim()) return
    await rejeterDemande(demande.id, motifRejet.trim())
    setRejectOpen(false)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/gestion/demandes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Demandes à traiter
      </Link>

      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="font-mono text-xs text-muted">{demande.numero}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-ink">Expression de besoin</h1>
          </div>
          <StatusPill config={demandeStatusConfig[demande.statut]} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Demandeur</p>
            <p className="mt-0.5 font-medium text-ink">{demandeur?.nom}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Poste</p>
            <p className="mt-0.5 text-ink">{demandeur?.poste}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Date</p>
            <p className="mt-0.5 text-ink">{formatDate(demande.date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Nombre d'articles</p>
            <p className="mt-0.5 tabular text-ink">{demande.lignes.length}</p>
          </div>
        </div>

        <div className="mt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-1.5 font-medium">Article</th>
                <th className="py-1.5 font-medium text-right">Quantité</th>
                <th className="py-1.5 font-medium text-right">Stock actuel</th>
              </tr>
            </thead>
            <tbody>
              {demande.lignes.map((ligne) => {
                const article = findArticle(ligne.articleId)
                const depasse = article && ligne.quantite > article.stock
                return (
                  <tr key={ligne.articleId} className="border-t border-line">
                    <td className="py-2 text-ink">{article?.designation || 'Article supprimé'}</td>
                    <td className="py-2 text-right tabular text-ink">{ligne.quantite}</td>
                    <td className={`py-2 text-right tabular ${depasse ? 'font-medium text-danger' : 'text-muted'}`}>{article?.stock}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {demande.motif ? (
          <div className="mt-4 rounded-md bg-paper-2 px-3.5 py-3">
            <p className="text-xs font-medium text-muted">Motif</p>
            <p className="mt-0.5 text-sm text-ink">{demande.motif}</p>
          </div>
        ) : null}

        {demande.statut === 'en_attente' ? (
          <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
            <Button variant="danger" icon={X} onClick={() => setRejectOpen(true)}>Rejeter</Button>
            <Button variant="gold" icon={Check} onClick={handleApprove}>Approuver</Button>
          </div>
        ) : null}

        {demande.statut === 'rejetee' ? (
          <div className="mt-5 flex gap-2.5 rounded-md bg-danger-bg px-3.5 py-3">
            <MessageSquareWarning size={16} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-xs font-medium text-danger">Motif du rejet, communiqué le {formatDate(demande.dateTraitement)}</p>
              <p className="mt-0.5 text-sm text-ink">{demande.motifRejet}</p>
            </div>
          </div>
        ) : null}

        {demande.statut === 'approuvee' ? (
          <div className="mt-5 flex items-center justify-between rounded-md border border-line px-3.5 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Bon {demande.bonNumero}</p>
              <p className="text-xs text-muted">Validé le {formatDate(demande.dateTraitement)}</p>
            </div>
            <Button variant="secondary" icon={FileCheck2} size="sm" onClick={() => navigate(`/bon/${demande.id}`)}>
              Voir le bon
            </Button>
          </div>
        ) : null}
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={`Rejeter ${demande.numero}`}>
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
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Annuler</Button>
          <Button variant="danger" disabled={!motifRejet.trim()} onClick={confirmReject}>Confirmer le rejet</Button>
        </div>
      </Modal>
    </div>
  )
}
