import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'
import EmptyState from '../../components/EmptyState'
import { CircleCheck } from 'lucide-react'

export default function Alertes() {
  const { articles } = useAppData()
  const actifs = articles.filter((a) => a.statut === 'disponible')

  const groupes = {
    critique: actifs.filter((a) => stockLevel(a.stock, a.seuil) === 'critique'),
    faible: actifs.filter((a) => stockLevel(a.stock, a.seuil) === 'faible'),
    normal: actifs.filter((a) => stockLevel(a.stock, a.seuil) === 'normal'),
  }

  return (
    <div>
      <PageHeader title="Alertes stock" description="Les articles sont classés selon leur position par rapport au seuil minimum défini." />

      {['critique', 'faible', 'normal'].map((level) => (
        <div key={level} className="mb-6">
          <div className="mb-2.5 flex items-center gap-2">
            <StatusPill config={stockLevelConfig[level]} />
            <span className="text-xs text-muted">({groupes[level].length})</span>
          </div>

          {groupes[level].length === 0 ? (
            level === 'critique' || level === 'faible' ? (
              <EmptyState icon={CircleCheck} title="Aucun article dans cette catégorie" description="Rien à signaler ici pour le moment." />
            ) : null
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-4 py-2 font-medium">Référence</th>
                    <th className="px-4 py-2 font-medium">Désignation</th>
                    <th className="px-4 py-2 font-medium">Catégorie</th>
                    <th className="px-4 py-2 font-medium text-right">Stock</th>
                    <th className="px-4 py-2 font-medium text-right">Seuil</th>
                  </tr>
                </thead>
                <tbody>
                  {groupes[level].map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-muted">{a.reference}</td>
                      <td className="px-4 py-2 font-medium text-ink">{a.designation}</td>
                      <td className="px-4 py-2 text-muted">{a.categorie}</td>
                      <td className="px-4 py-2 text-right tabular text-ink">{a.stock}</td>
                      <td className="px-4 py-2 text-right tabular text-muted">{a.seuil}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
