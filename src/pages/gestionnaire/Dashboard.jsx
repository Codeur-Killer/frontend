import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronRight } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig, demandeStatusConfig } from '../../utils/status'
import { formatDate, formatNumber } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'

const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Dashboard() {
  const { articles, demandes, mouvements } = useAppData()

  const stockTotal = articles.reduce((sum, a) => sum + a.stock, 0)
  const articlesCritiques = articles.filter((a) => a.statut === 'disponible' && stockLevel(a.stock, a.seuil) === 'critique')
  const alertes = articles.filter((a) => a.statut === 'disponible' && stockLevel(a.stock, a.seuil) !== 'normal')
  const enAttente = demandes.filter((d) => d.statut === 'en_attente')
  const approuvees = demandes.filter((d) => d.statut === 'approuvee')
  const rejetees = demandes.filter((d) => d.statut === 'rejetee')

  const now = new Date()
  const sortiesCeMois = mouvements.filter((m) => {
    const d = new Date(m.date)
    return m.type === 'sortie' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, m) => sum + m.quantite, 0)

  const stats = [
    { label: 'Stock total', value: formatNumber(stockTotal), suffix: 'articles', href: '/gestion/articles' },
    { label: 'Seuil critique', value: articlesCritiques.length, suffix: 'articles', href: '/gestion/alertes' },
    { label: 'Demandes en attente', value: enAttente.length, suffix: '', href: '/gestion/demandes?statut=en_attente' },
    { label: 'Demandes approuvées', value: approuvees.length, suffix: '', href: '/gestion/demandes?statut=approuvee' },
    { label: 'Demandes rejetées', value: rejetees.length, suffix: '', href: '/gestion/demandes?statut=rejetee' },
    { label: 'Sorties ce mois-ci', value: formatNumber(sortiesCeMois), suffix: 'unités', href: '/gestion/historique?onglet=sorties&periode=mois' },
  ]

  const chartData = useMemo(() => {
    const byMonth = {}
    mouvements.forEach((m) => {
      const d = new Date(m.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!byMonth[key]) byMonth[key] = { key, label: monthLabels[d.getMonth()], entrees: 0, sorties: 0, order: d.getFullYear() * 12 + d.getMonth() }
      byMonth[key][m.type === 'entree' ? 'entrees' : 'sorties'] += m.quantite
    })
    return Object.values(byMonth).sort((a, b) => a.order - b.order)
  }, [mouvements])

  return (
    <div>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble du stock et des expressions de besoin." />

      <div className="grid grid-cols-2 divide-x divide-line overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} to={s.href} className="px-4 py-4 transition-colors hover:bg-paper-2">
            <p className="text-2xl font-semibold tabular text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-line bg-surface p-5">
          <p className="mb-4 text-sm font-medium text-ink">Entrées et sorties par mois</p>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Aucun mouvement enregistré.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ left: -18, right: 8 }}>
                <CartesianGrid stroke="#E1DDD0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#656e81' }} axisLine={{ stroke: '#E1DDD0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#656e81' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#E1DDD0', fontSize: 13 }}
                  labelStyle={{ color: '#1D2B45', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#2F7D4F" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#B23A34" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 rounded-lg border border-line bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Demandes en attente</p>
            <Link to="/gestion/demandes" className="flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-2">
              Tout voir <ChevronRight size={13} />
            </Link>
          </div>
          {enAttente.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Aucune demande en attente.</p>
          ) : (
            <div className="space-y-2.5">
              {enAttente.slice(0, 4).map((d) => (
                <Link
                  key={d.id}
                  to={`/gestion/demandes/${d.id}`}
                  className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:border-ink/30"
                >
                  <div>
                    <p className="font-mono text-xs text-muted">{d.numero}</p>
                    <p className="text-sm text-ink">{formatDate(d.date)}</p>
                  </div>
                  <StatusPill config={demandeStatusConfig[d.statut]} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Articles en alerte de seuil</p>
          <Link to="/gestion/alertes" className="flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-2">
            Voir toutes les alertes <ChevronRight size={13} />
          </Link>
        </div>
        {alertes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Tous les articles sont à un niveau normal.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {alertes.slice(0, 6).map((a) => {
              const level = stockLevel(a.stock, a.seuil)
              return (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{a.designation}</p>
                    <p className="text-xs tabular text-muted">
                      {a.stock} / {a.seuil} {a.unite.toLowerCase()}
                    </p>
                  </div>
                  <StatusPill config={stockLevelConfig[level]} size="sm" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
