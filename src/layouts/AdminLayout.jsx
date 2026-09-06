import { Outlet, Navigate } from 'react-router-dom'
import { Users, FolderKanban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const items = [
  { to: '/admin/comptes', label: 'Comptes utilisateurs', icon: Users, end: true },
  { to: '/admin/programmes', label: 'Programmes', icon: FolderKanban },
]

export default function AdminLayout() {
  const { currentUser, loading } = useAuth()

  if (loading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/connexion" replace />

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar items={items} roleLabel="Espace administrateur" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={['Espace administrateur']} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
