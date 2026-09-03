import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-center px-6">
      <CompassIcon size={28} className="text-muted" />
      <h1 className="text-lg font-semibold text-ink">Cette page n'existe pas</h1>
      <p className="max-w-sm text-sm text-muted">
        L'adresse saisie ne correspond à aucun écran de G-UGP. Retournez à la connexion pour choisir un espace.
      </p>
      <Link to="/connexion" className="mt-2 text-sm font-medium text-gold hover:text-gold-2">
        Revenir à la connexion
      </Link>
    </div>
  )
}
