import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, PowerOff, Power, PackageSearch, ChevronRight } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig, articleStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const emptyForm = { designation: '', categorie: '', unite: '', stock: 0, seuil: 0, programmeId: '' }

export default function Articles() {
  const { articles, categories, programmes, findProgramme, addArticle, updateArticle, toggleArticleStatus } = useAppData()
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Toutes les catégories')
  const [statut, setStatut] = useState('Tous les statuts')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const filtres = useMemo(() => {
    return articles.filter((a) => {
      const matchQuery =
        !query ||
        a.designation.toLowerCase().includes(query.toLowerCase()) ||
        a.reference.toLowerCase().includes(query.toLowerCase())
      const matchCategorie = categorie === 'Toutes les catégories' || a.categorie === categorie
      const matchStatut =
        statut === 'Tous les statuts' ||
        (statut === 'disponible' && a.statut === 'disponible') ||
        (statut === 'desactive' && a.statut === 'desactive')
      return matchQuery && matchCategorie && matchStatut
    })
  }, [articles, query, categorie, statut])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, programmeId: programmes[0]?.id || '' })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(article) {
    setEditing(article)
    setForm({
      designation: article.designation,
      categorie: article.categorie,
      unite: article.unite,
      stock: article.stock,
      seuil: article.seuil,
      programmeId: article.programmeId,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      if (editing) {
        await updateArticle(editing.id, {
          designation: form.designation,
          categorie: form.categorie,
          unite: form.unite,
          stock: Number(form.stock),
          seuil: Number(form.seuil),
        })
      } else {
        await addArticle({
          designation: form.designation,
          categorie: form.categorie,
          unite: form.unite,
          stock: Number(form.stock),
          seuil: Number(form.seuil),
          programmeId: form.programmeId,
        })
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Gestion des articles"
        description="Créez, modifiez et désactivez les articles suivis dans le stock."
        actions={
          <Button variant="gold" icon={Plus} onClick={openCreate}>
            Nouvel article
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par référence ou désignation"
            className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-ink/40"
          />
        </div>
        <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40">
          <option>Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink/40">
          <option value="Tous les statuts">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="desactive">Désactivé</option>
        </select>
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={PackageSearch} title="Aucun article ne correspond" description="Modifiez les filtres ou créez un nouvel article." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Référence</th>
                  <th className="px-4 py-2.5 font-medium">Désignation</th>
                  <th className="px-4 py-2.5 font-medium">Programme</th>
                  <th className="px-4 py-2.5 font-medium">Catégorie</th>
                  <th className="px-4 py-2.5 font-medium text-right">Stock</th>
                  <th className="px-4 py-2.5 font-medium text-right">Seuil</th>
                  <th className="px-4 py-2.5 font-medium">Niveau</th>
                  <th className="px-4 py-2.5 font-medium">Statut</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((a) => {
                  const level = stockLevel(a.stock, a.seuil)
                  return (
                    <tr key={a.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{a.reference}</td>
                      <td className="px-4 py-2.5">
                        <Link to={`/gestion/articles/${a.id}`} className="font-medium text-ink hover:text-gold">{a.designation}</Link>
                        <p className="text-xs text-muted">{a.unite} · créé le {formatDate(a.dateCreation)}</p>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{findProgramme(a.programmeId)?.nom || '-'}</td>
                      <td className="px-4 py-2.5 text-muted">{a.categorie}</td>
                      <td className="px-4 py-2.5 text-right tabular text-ink">{a.stock}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted">{a.seuil}</td>
                      <td className="px-4 py-2.5">
                        {a.statut === 'disponible' ? <StatusPill config={stockLevelConfig[level]} size="sm" /> : <span className="text-xs text-muted">-</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusPill config={articleStatusConfig[a.statut]} size="sm" />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Link to={`/gestion/articles/${a.id}`} className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink" aria-label="Détail" title="Détail">
                            <ChevronRight size={15} />
                          </Link>
                          <button onClick={() => openEdit(a)} className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink" aria-label="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleArticleStatus(a.id)}
                            className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink"
                            aria-label={a.statut === 'disponible' ? 'Désactiver' : 'Activer'}
                            title={a.statut === 'disponible' ? 'Désactiver' : 'Activer'}
                          >
                            {a.statut === 'disponible' ? <PowerOff size={15} /> : <Power size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'article" : 'Nouvel article'}>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs text-muted">Désignation</label>
            <input
              required
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Programme</label>
            {editing ? (
              <p className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted">
                {findProgramme(form.programmeId)?.nom}
              </p>
            ) : (
              <select
                required
                value={form.programmeId}
                onChange={(e) => setForm({ ...form, programmeId: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              >
                <option value="" disabled>Choisir</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Catégorie</label>
              <select
                required
                value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              >
                <option value="" disabled>Choisir</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Unité</label>
              <input
                required
                placeholder="Paquet, Unité..."
                value={form.unite}
                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-ink/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Stock initial</label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm tabular focus:border-ink/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Seuil minimum</label>
              <input
                type="number"
                min={0}
                required
                value={form.seuil}
                onChange={(e) => setForm({ ...form, seuil: e.target.value })}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm tabular focus:border-ink/40"
              />
            </div>
          </div>
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="gold">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
