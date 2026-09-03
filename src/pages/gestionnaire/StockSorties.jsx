import { useState } from 'react'
import { ArrowUpFromLine, CircleCheck, TriangleAlert } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

const emptyForm = { articleId: '', quantite: 1, beneficiaire: '', document: '', observation: '' }

export default function StockSorties() {
  const { articles, mouvements, findArticle, addMouvement } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const disponibles = articles.filter((a) => a.statut === 'disponible')
  const sorties = mouvements.filter((m) => m.type === 'sortie').sort((a, b) => (a.date < b.date ? 1 : -1))
  const article = findArticle(form.articleId)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.articleId) return
    const result = await addMouvement({
      type: 'sortie',
      articleId: form.articleId,
      quantite: Number(form.quantite),
      beneficiaire: form.beneficiaire,
      document: form.document,
      observation: form.observation,
    })
    if (result.ok) {
      setFeedback(`Sortie enregistrée pour ${article.designation}.`)
      setForm(emptyForm)
    } else {
      setError(result.message)
    }
  }

  return (
    <div>
      <PageHeader title="Sorties de stock" description="Enregistrez une remise d'articles à un service et mettez à jour le stock." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="lg:col-span-2 h-fit rounded-lg border border-line bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-ink">Nouvelle sortie</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Article</label>
              <select
                required
                value={form.articleId}
                onChange={(e) => { setForm({ ...form, articleId: e.target.value }); setError(null) }}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              >
                <option value="" disabled>Choisir un article</option>
                {disponibles.map((a) => (
                  <option key={a.id} value={a.id}>{a.designation} · stock actuel {a.stock}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Quantité à sortir</label>
              <input
                type="number"
                min={1}
                required
                value={form.quantite}
                onChange={(e) => { setForm({ ...form, quantite: e.target.value }); setError(null) }}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm tabular focus:border-ink/40"
              />
              {article ? <p className="mt-1 text-xs text-muted">Stock disponible : {article.stock} {article.unite.toLowerCase()}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Bénéficiaire</label>
              <input
                value={form.beneficiaire}
                onChange={(e) => setForm({ ...form, beneficiaire: e.target.value })}
                placeholder="Ex. Direction Technique"
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Numéro du document</label>
              <input
                placeholder="BS-2026-0001"
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Observation</label>
              <textarea
                rows={2}
                value={form.observation}
                onChange={(e) => setForm({ ...form, observation: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              />
            </div>
            <Button type="submit" variant="gold" icon={ArrowUpFromLine} className="w-full">
              Enregistrer la sortie
            </Button>
            {error ? (
              <p className="flex items-center gap-1.5 text-xs text-danger">
                <TriangleAlert size={13} /> {error}
              </p>
            ) : null}
            {feedback ? (
              <p className="flex items-center gap-1.5 text-xs text-ok">
                <CircleCheck size={13} /> {feedback}
              </p>
            ) : null}
          </div>
        </form>

        <div className="lg:col-span-3 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <p className="text-sm font-medium text-ink">Historique des sorties</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Article</th>
                <th className="px-4 py-2 font-medium text-right">Quantité</th>
                <th className="px-4 py-2 font-medium">Bénéficiaire</th>
                <th className="px-4 py-2 font-medium">Document</th>
              </tr>
            </thead>
            <tbody>
              {sorties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">Aucune sortie enregistrée.</td>
                </tr>
              ) : sorties.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 text-muted">{formatDate(m.date)}</td>
                  <td className="px-4 py-2 text-ink">{findArticle(m.articleId)?.designation}</td>
                  <td className="px-4 py-2 text-right tabular font-medium text-danger">-{m.quantite}</td>
                  <td className="px-4 py-2 text-muted">{m.beneficiaire || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{m.document || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
