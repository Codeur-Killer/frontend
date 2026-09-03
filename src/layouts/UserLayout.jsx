import { Outlet, Navigate } from 'react-router-dom'
import { Package, FilePlus2, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const items = [
  { to: '/app/articles', label: 'Catalogue des articles', icon: Package, end: true },
  { to: '/app/nouvelle-demande', label: 'Nouvelle demande', icon: FilePlus2 },
  { to: '/app/mes-demandes', label: 'Mes demandes', icon: ClipboardList },
]

export default function UserLayout() {
  const { currentUser, loading } = useAuth()

  const homeByRole = { admin: '/admin/comptes', gestionnaire: '/gestion/tableau-de-bord' }

  if (loading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.mustChangePassword) return <Navigate to="/mot-de-passe" replace />
  if (currentUser.role !== 'utilisateur') return <Navigate to={homeByRole[currentUser.role] || '/connexion'} replace />

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar items={items} roleLabel="Espace utilisateur" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={['Espace utilisateur']} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
