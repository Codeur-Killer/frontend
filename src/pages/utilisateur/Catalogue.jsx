import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PackagePlus, PackageSearch } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function Catalogue() {
  const { articles, categories } = useAppData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Toutes les catégories')

  const disponibles = articles.filter((a) => a.statut === 'disponible')

  const filtres = useMemo(() => {
    return disponibles.filter((a) => {
      const matchQuery =
        !query ||
        a.designation.toLowerCase().includes(query.toLowerCase()) ||
        a.reference.toLowerCase().includes(query.toLowerCase())
      const matchCategorie = categorie === 'Toutes les catégories' || a.categorie === categorie
      return matchQuery && matchCategorie
    })
  }, [disponibles, query, categorie])

  return (
    <div>
      <PageHeader
        title="Catalogue des articles"
        description="Consultez les articles disponibles et leur niveau de stock avant de soumettre une demande."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par référence ou désignation"
            className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-ink/40"
          />
        </div>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40"
        >
          <option>Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtres.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Aucun article ne correspond à cette recherche"
          description="Essayez un autre mot-clé ou choisissez une autre catégorie."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Référence</th>
                <th className="px-4 py-2.5 font-medium">Désignation</th>
                <th className="px-4 py-2.5 font-medium">Catégorie</th>
                <th className="px-4 py-2.5 font-medium">Unité</th>
                <th className="px-4 py-2.5 font-medium">Disponibilité</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((a) => {
                const level = stockLevel(a.stock, a.seuil)
                return (
                  <tr key={a.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{a.reference}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">{a.designation}</td>
                    <td className="px-4 py-2.5 text-muted">{a.categorie}</td>
                    <td className="px-4 py-2.5 text-muted">{a.unite}</td>
                    <td className="px-4 py-2.5">
                      <StatusPill config={stockLevelConfig[level]} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => navigate(`/app/nouvelle-demande?article=${a.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:border-ink/40"
                      >
                        <PackagePlus size={14} />
                        Ajouter à une demande
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
