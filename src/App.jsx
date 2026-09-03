import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import NotFound from './pages/NotFound'
import BonPrint from './pages/BonPrint'
import UserLayout from './layouts/UserLayout'
import ManagerLayout from './layouts/ManagerLayout'
import AdminLayout from './layouts/AdminLayout'

import Catalogue from './pages/utilisateur/Catalogue'
import NouvelleDemande from './pages/utilisateur/NouvelleDemande'
import MesDemandes from './pages/utilisateur/MesDemandes'
import DemandeDetailUtilisateur from './pages/utilisateur/DemandeDetail'

import Dashboard from './pages/gestionnaire/Dashboard'
import Articles from './pages/gestionnaire/Articles'
import ArticleDetail from './pages/gestionnaire/ArticleDetail'
import StockEntrees from './pages/gestionnaire/StockEntrees'
import StockSorties from './pages/gestionnaire/StockSorties'
import Alertes from './pages/gestionnaire/Alertes'
import Demandes from './pages/gestionnaire/Demandes'
import DemandeDetailGestion from './pages/gestionnaire/DemandeDetail'
import Bons from './pages/gestionnaire/Bons'
import Historique from './pages/gestionnaire/Historique'
import Rapports from './pages/gestionnaire/Rapports'

import Comptes from './pages/admin/Comptes'
import ProgrammesAdmin from './pages/admin/Programmes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/mot-de-passe" element={<ChangePassword />} />
      <Route path="/bon/:id" element={<BonPrint />} />

      <Route path="/app" element={<UserLayout />}>
        <Route index element={<Navigate to="articles" replace />} />
        <Route path="articles" element={<Catalogue />} />
        <Route path="nouvelle-demande" element={<NouvelleDemande />} />
        <Route path="mes-demandes" element={<MesDemandes />} />
        <Route path="mes-demandes/:id" element={<DemandeDetailUtilisateur />} />
      </Route>

      <Route path="/gestion" element={<ManagerLayout />}>
        <Route index element={<Navigate to="tableau-de-bord" replace />} />
        <Route path="tableau-de-bord" element={<Dashboard />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleDetail />} />
        <Route path="stock/entrees" element={<StockEntrees />} />
        <Route path="stock/sorties" element={<StockSorties />} />
        <Route path="alertes" element={<Alertes />} />
        <Route path="demandes" element={<Demandes />} />
        <Route path="demandes/:id" element={<DemandeDetailGestion />} />
        <Route path="bons" element={<Bons />} />
        <Route path="historique" element={<Historique />} />
        <Route path="rapports" element={<Rapports />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="comptes" replace />} />
        <Route path="comptes" element={<Comptes />} />
        <Route path="programmes" element={<ProgrammesAdmin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
