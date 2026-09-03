import { Link, useParams, Navigate } from 'react-router-dom'
import { FileCheck2, ArrowLeft, MessageSquareWarning } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import Button from '../../components/Button'

export default function DemandeDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { demandes, findArticle } = useAppData()
  const demande = demandes.find((d) => d.id === id)

  if (!demande || demande.demandeurId !== currentUser.id) {
    return <Navigate to="/app/mes-demandes" replace />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/mes-demandes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Mes demandes
      </Link>

      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="font-mono text-xs text-muted">{demande.numero}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-ink">Expression de besoin</h1>
            <p className="mt-1 text-sm text-muted">Soumise le {formatDate(demande.date)}</p>
          </div>
          <StatusPill config={demandeStatusConfig[demande.statut]} />
        </div>

        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-1.5 font-medium">Article</th>
                <th className="py-1.5 font-medium">Quantité</th>
              </tr>
            </thead>
            <tbody>
              {demande.lignes.map((ligne) => {
                const article = findArticle(ligne.articleId)
                return (
                  <tr key={ligne.articleId} className="border-t border-line">
                    <td className="py-2 text-ink">{article?.designation || 'Article supprimé'}</td>
                    <td className="py-2 tabular text-muted">
                      {ligne.quantite} {article?.unite?.toLowerCase()}
                    </td>
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

        {demande.statut === 'rejetee' ? (
          <div className="mt-4 flex gap-2.5 rounded-md bg-danger-bg px-3.5 py-3">
            <MessageSquareWarning size={16} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-xs font-medium text-danger">Motif du rejet</p>
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
            <Link to={`/bon/${demande.id}`} target="_blank">
              <Button variant="secondary" icon={FileCheck2} size="sm">
                Voir le bon
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
