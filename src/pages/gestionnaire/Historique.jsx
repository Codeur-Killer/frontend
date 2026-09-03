import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'

const tabs = [
  { key: 'entrees', label: 'Entrées' },
  { key: 'sorties', label: 'Sorties' },
  { key: 'demandes', label: 'Expressions de besoin' },
]

const tabKeys = tabs.map((t) => t.key)

export default function Historique() {
  const { mouvements, demandes, findArticle, findUser } = useAppData()
  const [searchParams] = useSearchParams()
  const ongletParam = searchParams.get('onglet')
  const moisEnCours = searchParams.get('periode') === 'mois'
  const [tab, setTab] = useState(tabKeys.includes(ongletParam) ? ongletParam : 'entrees')

  const now = new Date()
  const dansLeMois = (m) => {
    if (!moisEnCours) return true
    const d = new Date(m.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const entrees = mouvements.filter((m) => m.type === 'entree' && dansLeMois(m)).sort((a, b) => (a.date < b.date ? 1 : -1))
  const sorties = mouvements.filter((m) => m.type === 'sortie' && dansLeMois(m)).sort((a, b) => (a.date < b.date ? 1 : -1))
  const demandesTriees = [...demandes].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Historique"
        description={moisEnCours ? 'Opérations du mois en cours uniquement.' : 'Toutes les opérations sont conservées pour assurer une traçabilité complète.'}
      />

      <div className="mb-4 flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-ink text-white' : 'text-muted hover:bg-paper-2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'entrees' ? (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Article</th>
                <th className="px-4 py-2.5 font-medium text-right">Quantité</th>
                <th className="px-4 py-2.5 font-medium">Provenance</th>
                <th className="px-4 py-2.5 font-medium">Référence</th>
                <th className="px-4 py-2.5 font-medium">Observation</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 text-muted">{formatDate(m.date)}</td>
                  <td className="px-4 py-2 text-ink">{findArticle(m.articleId)?.designation}</td>
                  <td className="px-4 py-2 text-right tabular font-medium text-ok">+{m.quantite}</td>
                  <td className="px-4 py-2 text-muted">{m.provenance || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{m.document || '-'}</td>
                  <td className="px-4 py-2 text-muted">{m.observation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'sorties' ? (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Article</th>
                <th className="px-4 py-2.5 font-medium text-right">Quantité</th>
                <th className="px-4 py-2.5 font-medium">Bénéficiaire</th>
                <th className="px-4 py-2.5 font-medium">Référence du bon</th>
                <th className="px-4 py-2.5 font-medium">Observation</th>
              </tr>
            </thead>
            <tbody>
              {sorties.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 text-muted">{formatDate(m.date)}</td>
                  <td className="px-4 py-2 text-ink">{findArticle(m.articleId)?.designation}</td>
                  <td className="px-4 py-2 text-right tabular font-medium text-danger">-{m.quantite}</td>
                  <td className="px-4 py-2 text-muted">{m.beneficiaire || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{m.document || '-'}</td>
                  <td className="px-4 py-2 text-muted">{m.observation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'demandes' ? (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Numéro</th>
                <th className="px-4 py-2.5 font-medium">Demandeur</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5 font-medium">Validateur</th>
                <th className="px-4 py-2.5 font-medium">Date de validation</th>
              </tr>
            </thead>
            <tbody>
              {demandesTriees.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink">{d.numero}</td>
                  <td className="px-4 py-2 text-ink">{findUser(d.demandeurId)?.nom}</td>
                  <td className="px-4 py-2 text-muted">{formatDate(d.date)}</td>
                  <td className="px-4 py-2"><StatusPill config={demandeStatusConfig[d.statut]} size="sm" /></td>
                  <td className="px-4 py-2 text-muted">{d.traitePar ? findUser(d.traitePar)?.nom : '-'}</td>
                  <td className="px-4 py-2 text-muted">{d.dateTraitement ? formatDate(d.dateTraitement) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
