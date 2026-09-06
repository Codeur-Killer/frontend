import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList, FileCheck2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const filters = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuvee', label: 'Approuvées' },
  { key: 'rejetee', label: 'Rejetées' },
]

export default function MesDemandes() {
  const { currentUser } = useAuth()
  const { demandes, findArticle } = useAppData()
  const [filter, setFilter] = useState('toutes')

  const mine = demandes
    .filter((d) => d.demandeurId === currentUser.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const visible = filter === 'toutes' ? mine : mine.filter((d) => d.statut === filter)

  return (
    <div>
      <PageHeader title="Mes demandes" description="Suivez l'état de vos expressions de besoin et retrouvez vos bons validés." />

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
        <EmptyState
          icon={ClipboardList}
          title="Aucune demande ici"
          description="Les expressions de besoin que vous soumettez apparaîtront dans cette liste."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Numéro</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Articles</th>
                  <th className="px-4 py-2.5 font-medium">Statut</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">{d.numero}</td>
                    <td className="px-4 py-2.5 text-muted">{formatDate(d.date)}</td>
                    <td className="px-4 py-2.5 text-muted">
                      {d.lignes.length} article{d.lignes.length > 1 ? 's' : ''}
                      <span className="ml-1 text-xs text-muted/70">
                        ({d.lignes.map((l) => findArticle(l.articleId)?.designation).filter(Boolean).join(', ')})
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill config={demandeStatusConfig[d.statut]} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {d.statut === 'approuvee' ? (
                          <Link
                            to={`/bon/${d.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-gold"
                          >
                            <FileCheck2 size={14} /> Bon
                          </Link>
                        ) : null}
                        <Link
                          to={`/app/mes-demandes/${d.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-gold"
                        >
                          Détail <ChevronRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
