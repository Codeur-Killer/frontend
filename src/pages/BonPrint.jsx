import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'
import { formatDate, numberToWordsFr } from '../utils/format'
import { orgInfo } from '../data/orgInfo'
import Button from '../components/Button'

export default function BonPrint() {
  const { id } = useParams()
  const { currentUser, loading } = useAuth()
  const { demandes, findUser, findArticle } = useAppData()

  if (loading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />

  const demande = demandes.find((d) => d.id === id)

  if (!demande || demande.statut !== 'approuvee') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <p className="font-medium text-ink">Ce bon n'est pas disponible</p>
        <p className="max-w-sm text-sm text-muted">
          Le bon ne peut être consulté que pour une demande approuvée et générée.
        </p>
        <Link to="/connexion" className="text-sm font-medium text-gold hover:text-gold-2">Revenir à la connexion</Link>
      </div>
    )
  }

  const demandeur = findUser(demande.demandeurId)
  const retour = currentUser.role === 'gestionnaire' ? `/gestion/demandes/${demande.id}` : `/app/mes-demandes/${demande.id}`

  return (
    <div className="min-h-screen bg-paper-2 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex w-full max-w-[720px] items-center justify-between px-2">
        <Link to={retour} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> Retour
        </Link>
        <Button variant="gold" icon={Printer} onClick={() => window.print()}>Imprimer</Button>
      </div>

      <div className="print-sheet mx-auto w-full max-w-[720px] border border-ink/15 bg-white p-10 text-sm shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="text-center leading-tight">
            <p className="font-semibold text-ink">{orgInfo.presidence}</p>
            <p className="text-ink">{orgInfo.separateur}</p>
            <p className="mx-auto mt-1 max-w-[280px] font-semibold uppercase text-ink">{demande.programmeNom}</p>
            <p className="text-ink">{orgInfo.separateur}</p>
            <p className="mt-3 font-semibold text-ink">{orgInfo.coordination}</p>
            <p className="text-ink">{orgInfo.separateur}</p>
            <p className="mt-3 font-semibold text-ink">{orgInfo.unite}</p>
          </div>
          <div className="shrink-0 text-center leading-tight">
            <p className="font-semibold text-ink">{orgInfo.republique}</p>
            <p className="text-xs font-semibold text-ink">{orgInfo.devise}</p>
            <p className="mt-3 whitespace-nowrap font-semibold text-ink">{orgInfo.ville}, le {formatDate(demande.dateTraitement)}</p>
          </div>
        </div>

        <p className="mt-5 font-mono text-ink">
          N° <span className="font-semibold">{demande.bonNumero}</span>
        </p>

        <h1 className="mt-10 text-center text-lg font-bold uppercase text-ink">Bon pour</h1>

        <ul className="mx-auto mt-6 max-w-md list-disc space-y-1.5 pl-5">
          {demande.lignes.map((ligne) => {
            const article = findArticle(ligne.articleId)
            return (
              <li key={ligne.articleId} className="text-ink">
                {numberToWordsFr(ligne.quantite)} ({ligne.quantite} {article?.unite}) {article?.designation}
              </li>
            )
          })}
        </ul>

        <p className="mt-10 text-ink">Au profit de {demandeur?.poste}</p>

        <p className="mt-14 text-ink">Nom prénom et signature du bénéficiaire ou du responsable de groupe</p>
        <div className="mt-8 h-12">
          <p className="text-ink font-semibold">{demandeur?.nom}</p>
        </div>

        <p className="mt-6 text-ink">
          <span className="font-semibold">Avis de l'assistant administratif et comptable</span> : <span className="font-semibold min-w-[220px]  border-ink/40">Kit disponible, favorable</span>
        </p>

        <div className="mt-10 flex items-end justify-between  gap-16">
          <div>
            <p className="mb-1.5 font-medium text-ink">Approuvé</p>
            <div className="flex h-9 w-9 items-center justify-center border border-ink text-ink">✓</div>
          </div>
          <div>
            <p className="mb-1.5 font-medium text-ink">Rejeté</p>
            <div className="h-9 w-9 border border-ink" />
          </div>
        </div>
      </div>
    </div>
  )
}
