import { Link } from 'react-router-dom'
import { FileCheck2 } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'

export default function Bons() {
  const { demandes, findUser, findArticle } = useAppData()
  const bons = demandes.filter((d) => d.statut === 'approuvee').sort((a, b) => (a.dateTraitement < b.dateTraitement ? 1 : -1))

  return (
    <div>
      <PageHeader title="Bons générés" description="Retrouvez et imprimez les bons de sortie issus des demandes approuvées." />

      {bons.length === 0 ? (
        <EmptyState icon={FileCheck2} title="Aucun bon pour le moment" description="Un bon est généré automatiquement dès qu'une demande est approuvée." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Bon</th>
                  <th className="px-4 py-2.5 font-medium">Demande liée</th>
                  <th className="px-4 py-2.5 font-medium">Demandeur</th>
                  <th className="px-4 py-2.5 font-medium">Date de validation</th>
                  <th className="px-4 py-2.5 font-medium text-right">Articles</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {bons.map((d) => {
                  const demandeur = findUser(d.demandeurId)
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">{d.bonNumero}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{d.numero}</td>
                      <td className="px-4 py-2.5 text-ink">{demandeur?.nom}</td>
                      <td className="px-4 py-2.5 text-muted">{formatDate(d.dateTraitement)}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted">{d.lignes.length}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link to={`/bon/${d.id}`} target="_blank">
                          <Button variant="secondary" size="sm" icon={FileCheck2}>Voir</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
