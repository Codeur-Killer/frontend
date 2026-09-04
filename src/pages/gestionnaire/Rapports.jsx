import { useMemo, useState } from 'react'
import { Download, Printer, FileBarChart } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import { orgInfo } from '../../data/orgInfo'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

const emptyFilters = { du: '', au: '', demandeurId: 'Tous les demandeurs', statut: 'Tous les statuts', articleId: 'Tous les articles' }

export default function Rapports() {
  const { demandes, articles, users, findUser, findArticle } = useAppData()
  const [filters, setFilters] = useState(emptyFilters)

  const utilisateurs = users.filter((u) => u.role === 'utilisateur')

  const resultats = useMemo(() => {
    return demandes
      .filter((d) => {
        if (filters.du && d.date < filters.du) return false
        if (filters.au && d.date > filters.au) return false
        if (filters.demandeurId !== 'Tous les demandeurs' && d.demandeurId !== filters.demandeurId) return false
        if (filters.statut !== 'Tous les statuts' && d.statut !== filters.statut) return false
        if (filters.articleId !== 'Tous les articles' && !d.lignes.some((l) => l.articleId === filters.articleId)) return false
        return true
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [demandes, filters])

  const programmeNoms = [...new Set(resultats.map((d) => d.programmeNom).filter(Boolean))]

  function exportCsv() {
    const header = ['Numero', 'Demandeur', 'Date', 'Articles', 'Statut', 'Validateur', 'Date de validation']
    const rows = resultats.map((d) => [
      d.numero,
      findUser(d.demandeurId)?.nom || '',
      formatDate(d.date),
      d.lignes.map((l) => `${findArticle(l.articleId)?.designation} (${l.quantite})`).join(' ; '),
      demandeStatusConfig[d.statut]?.label || d.statut,
      d.traitePar ? findUser(d.traitePar)?.nom : '',
      d.dateTraitement ? formatDate(d.dateTraitement) : '',
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'expressions-de-besoin.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Rapports et exports"
        description="Filtrez les expressions de besoin selon une période ou d'autres critères, puis exportez les résultats."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={exportCsv} className="print:hidden">
              Exporter en CSV
            </Button>
            <Button variant="gold" icon={Printer} onClick={() => window.print()} className="print:hidden">
              Imprimer en PDF
            </Button>
          </>
        }
      />

      <div className="mb-6 hidden print:block">
        <div className="flex items-start justify-between gap-6">
          <div className="text-center leading-tight">
            <p className="font-semibold text-ink">{orgInfo.presidence}</p>
            <p className="text-ink">{orgInfo.separateur}</p>
            {programmeNoms.length > 0 ? (
              <>
                <p className="mx-auto mt-1 max-w-[280px] font-semibold uppercase text-ink">{programmeNoms.join(' / ')}</p>
                <p className="text-ink">{orgInfo.separateur}</p>
              </>
            ) : null}
            <p className="mt-3 font-semibold text-ink">{orgInfo.coordination}</p>
            <p className="text-ink">{orgInfo.separateur}</p>
            <p className="mt-3 font-semibold text-ink">{orgInfo.unite}</p>
          </div>
          <div className="shrink-0 text-center leading-tight">
            <p className="font-semibold text-ink">{orgInfo.republique}</p>
            <p className="text-xs font-semibold text-ink">{orgInfo.devise}</p>
            <p className="mt-3 whitespace-nowrap font-semibold text-ink">{orgInfo.ville}, le {formatDate(new Date())}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-ink">
          Rapport des expressions de besoin
          {filters.du || filters.au ? ` - du ${filters.du ? formatDate(filters.du) : '...'} au ${filters.au ? formatDate(filters.au) : '...'}` : ''}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2.5 print:hidden">
        <div>
          <label className="mb-1 block text-xs text-muted">Du</label>
          <input type="date" value={filters.du} onChange={(e) => setFilters({ ...filters, du: e.target.value })} className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Au</label>
          <input type="date" value={filters.au} onChange={(e) => setFilters({ ...filters, au: e.target.value })} className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Demandeur</label>
          <select value={filters.demandeurId} onChange={(e) => setFilters({ ...filters, demandeurId: e.target.value })} className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40">
            <option>Tous les demandeurs</option>
            {utilisateurs.map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Statut</label>
          <select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })} className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40">
            <option>Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="approuvee">Approuvée</option>
            <option value="rejetee">Rejetée</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Article</label>
          <select value={filters.articleId} onChange={(e) => setFilters({ ...filters, articleId: e.target.value })} className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40">
            <option>Tous les articles</option>
            {articles.map((a) => <option key={a.id} value={a.id}>{a.designation}</option>)}
          </select>
        </div>
        {JSON.stringify(filters) !== JSON.stringify(emptyFilters) ? (
          <button onClick={() => setFilters(emptyFilters)} className="text-sm text-muted underline decoration-line underline-offset-2 hover:text-ink">
            Réinitialiser
          </button>
        ) : null}
      </div>

      {resultats.length === 0 ? (
        <EmptyState icon={FileBarChart} title="Aucun résultat" description="Ajustez les filtres pour élargir la recherche." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Numéro</th>
                <th className="px-4 py-2.5 font-medium">Demandeur</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Articles</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink">{d.numero}</td>
                  <td className="px-4 py-2 text-ink">{findUser(d.demandeurId)?.nom}</td>
                  <td className="px-4 py-2 text-muted">{formatDate(d.date)}</td>
                  <td className="px-4 py-2 text-muted">{d.lignes.map((l) => findArticle(l.articleId)?.designation).filter(Boolean).join(', ')}</td>
                  <td className="px-4 py-2"><StatusPill config={demandeStatusConfig[d.statut]} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
