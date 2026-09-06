import { Outlet, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  BellRing,
  ClipboardCheck,
  FileCheck2,
  History,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'
import { stockLevel } from '../utils/status'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import NotificationCenter from '../components/NotificationCenter'

export default function ManagerLayout() {
  const { currentUser, loading } = useAuth()
  const { articles, demandes } = useAppData()

  const homeByRole = { admin: '/admin/comptes', utilisateur: '/app/articles' }

  if (loading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.mustChangePassword) return <Navigate to="/mot-de-passe" replace />
  if (currentUser.role !== 'gestionnaire') return <Navigate to={homeByRole[currentUser.role] || '/connexion'} replace />

  const alertCount = articles.filter((a) => a.statut === 'disponible' && stockLevel(a.stock, a.seuil) !== 'normal').length
  const pendingCount = demandes.filter((d) => d.statut === 'en_attente').length

  const items = [
    { to: '/gestion/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/gestion/articles', label: 'Articles', icon: Package },
    { to: '/gestion/stock/entrees', label: 'Entrées de stock', icon: ArrowDownToLine },
    { to: '/gestion/stock/sorties', label: 'Sorties de stock', icon: ArrowUpFromLine },
    { to: '/gestion/alertes', label: 'Alertes', icon: BellRing, badge: alertCount || undefined },
    { to: '/gestion/demandes', label: 'Demandes à traiter', icon: ClipboardCheck, badge: pendingCount || undefined },
    { to: '/gestion/bons', label: 'Bons générés', icon: FileCheck2 },
    { to: '/gestion/historique', label: 'Historique', icon: History },
    { to: '/gestion/rapports', label: 'Rapports et exports', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-paper">
      <NotificationCenter />
      <Sidebar items={items} roleLabel="Espace gestionnaire" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={['Espace gestionnaire']} alertHref="/gestion/alertes" alertCount={alertCount} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
