import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, TriangleAlert, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

export default function NouvelleDemande() {
  const { currentUser } = useAuth()
  const { articles, programmes, addDemande, findArticle } = useAppData()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [programmeId, setProgrammeId] = useState('')
  const disponibles = articles.filter((a) => a.statut === 'disponible' && a.programmeId === programmeId)
  const [articleId, setArticleId] = useState(disponibles[0]?.id || '')
  const [quantite, setQuantite] = useState(1)
  const [lignes, setLignes] = useState([])
  const [motif, setMotif] = useState('')

  // programmes se charge de façon asynchrone (après l'authentification) :
  // on ne peut pas se contenter d'un état initial à partir de useState.
  useEffect(() => {
    if (!programmeId && programmes.length > 0) setProgrammeId(programmes[0].id)
  }, [programmes, programmeId])

  useEffect(() => {
    const preselect = searchParams.get('article')
    const article = preselect && findArticle(preselect)
    if (article) {
      setProgrammeId(article.programmeId)
      setLignes((prev) => (prev.some((l) => l.articleId === preselect) ? prev : [...prev, { articleId: preselect, quantite: 1 }]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleProgrammeChange(id) {
    setProgrammeId(id)
    setLignes([])
    setArticleId('')
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!articleId || quantite < 1) return
    setLignes((prev) => {
      const existing = prev.find((l) => l.articleId === articleId)
      if (existing) {
        return prev.map((l) => (l.articleId === articleId ? { ...l, quantite: l.quantite + Number(quantite) } : l))
      }
      return [...prev, { articleId, quantite: Number(quantite) }]
    })
    setQuantite(1)
  }

  function updateLigneQuantite(id, value) {
    setLignes((prev) => prev.map((l) => (l.articleId === id ? { ...l, quantite: Math.max(1, Number(value) || 1) } : l)))
  }

  function removeLigne(id) {
    setLignes((prev) => prev.filter((l) => l.articleId !== id))
  }

  async function handleSubmit() {
    if (lignes.length === 0) return
    const demande = await addDemande({ demandeurId: currentUser.id, lignes, motif })
    navigate(`/app/mes-demandes/${demande.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Nouvelle expression de besoin"
        description="Ajoutez un ou plusieurs articles, précisez les quantités, puis soumettez votre demande."
      />

      {programmes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Vous n'êtes rattaché à aucun programme. Contactez un administrateur pour pouvoir soumettre une expression de besoin.
        </p>
      ) : (
        <>
          {programmes.length > 1 ? (
            <div className="mb-4">
              <label className="mb-1 block text-xs text-muted">Programme</label>
              <select
                value={programmeId}
                onChange={(e) => handleProgrammeChange(e.target.value)}
                className="w-full max-w-xs rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">Une demande ne peut porter que sur les articles d'un seul programme.</p>
            </div>
          ) : null}

      <form onSubmit={handleAdd} className="rounded-lg border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Ajouter un article</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs text-muted">Article</label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40"
            >
              {disponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.designation} ({a.unite})
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs text-muted">Quantité</label>
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink tabular focus:border-ink/40"
            />
          </div>
          <Button type="submit" variant="secondary" icon={Plus}>
            Ajouter
          </Button>
        </div>
      </form>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-ink">Articles de la demande</p>
        {lignes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Aucun article ajouté pour le moment.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Article</th>
                  <th className="px-4 py-2 font-medium">Quantité</th>
                  <th className="px-4 py-2 font-medium">Stock disponible</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => {
                  const article = findArticle(ligne.articleId)
                  if (!article) return null
                  const depasse = ligne.quantite > article.stock
                  return (
                    <tr key={ligne.articleId} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-medium text-ink">{article.designation}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={1}
                          value={ligne.quantite}
                          onChange={(e) => updateLigneQuantite(ligne.articleId, e.target.value)}
                          className="w-20 rounded-md border border-line bg-surface px-2 py-1 text-sm tabular focus:border-ink/40"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`tabular ${depasse ? 'font-medium text-danger' : 'text-muted'}`}>
                          {article.stock} {article.unite.toLowerCase()}
                        </span>
                        {depasse ? (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-danger">
                            <TriangleAlert size={12} /> quantité supérieure au stock
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => removeLigne(ligne.articleId)}
                          className="rounded-md p-1.5 text-muted hover:bg-danger-bg hover:text-danger"
                          aria-label="Retirer"
                        >
                          <Trash2 size={15} />
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

      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-ink">Motif ou justification</label>
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={3}
          placeholder="Ex. besoin en fournitures pour les activités du service"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/40"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="gold" icon={Send} disabled={lignes.length === 0} onClick={handleSubmit}>
          Soumettre la demande
        </Button>
      </div>
        </>
      )}
    </div>
  )
}
