import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { http } from '../api/httpClient'

const AppDataContext = createContext(null)

const empty = { articles: [], mouvements: [], demandes: [], users: [], categories: [], programmes: [] }

export function AppDataProvider({ children }) {
  const { currentUser } = useAuth()
  const [state, setState] = useState(empty)
  const [loading, setLoading] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [articles, mouvements, demandes, users, categories, programmes] = await Promise.all([
        http.get('/articles'),
        http.get('/mouvements'),
        http.get('/demandes'),
        http.get('/users'),
        http.get('/categories'),
        http.get('/programmes'),
      ])
      setState({ articles, mouvements, demandes, users, categories, programmes })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Tant qu'un changement de mot de passe est exigé, l'API refuse ces
    // routes (défense en profondeur) : inutile d'appeler et ça éviterait
    // de toute façon un rechargement une fois le mot de passe changé.
    if (currentUser && !currentUser.mustChangePassword) loadAll()
    else setState(empty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!currentUser, currentUser?.mustChangePassword])

  const api = useMemo(() => {
    const findArticle = (id) => state.articles.find((a) => a.id === id)
    const findUser = (id) => state.users.find((u) => u.id === id)
    const findProgramme = (id) => state.programmes.find((p) => p.id === id)

    async function refetchArticles() {
      const articles = await http.get('/articles')
      setState((s) => ({ ...s, articles }))
    }
    async function refetchMouvements() {
      const mouvements = await http.get('/mouvements')
      setState((s) => ({ ...s, mouvements }))
    }
    async function refetchDemandes() {
      const demandes = await http.get('/demandes')
      setState((s) => ({ ...s, demandes }))
    }
    async function refetchUsers() {
      const users = await http.get('/users')
      setState((s) => ({ ...s, users }))
    }
    async function refetchProgrammes() {
      const programmes = await http.get('/programmes')
      setState((s) => ({ ...s, programmes }))
    }

    return {
      articles: state.articles,
      mouvements: state.mouvements,
      demandes: state.demandes,
      users: state.users,
      categories: state.categories,
      programmes: state.programmes,
      loading,
      findArticle,
      findUser,
      findProgramme,

      async addUser(input) {
        const user = await http.post('/users', input)
        await refetchUsers()
        return user
      },

      async updateUser(id, patch) {
        await http.patch(`/users/${id}`, patch)
        await refetchUsers()
      },

      async setUserActive(id, actif) {
        await http.patch(`/users/${id}/status`, { actif })
        await refetchUsers()
      },

      async resetPassword(id) {
        const result = await http.patch(`/users/${id}/password`, {})
        await refetchUsers()
        return result
      },

      async addArticle(input) {
        const article = await http.post('/articles', input)
        await refetchArticles()
        return article
      },

      async updateArticle(id, patch) {
        await http.patch(`/articles/${id}`, patch)
        await refetchArticles()
      },

      async toggleArticleStatus(id) {
        await http.patch(`/articles/${id}/status`, {})
        await refetchArticles()
      },

      async addMouvement(input) {
        try {
          const mouvement = await http.post('/mouvements', input)
          await Promise.all([refetchArticles(), refetchMouvements()])
          return { ok: true, mouvement }
        } catch (err) {
          return { ok: false, message: err.message }
        }
      },

      async addDemande(input) {
        const demande = await http.post('/demandes', input)
        await refetchDemandes()
        return demande
      },

      async approuverDemande(id) {
        const demande = await http.patch(`/demandes/${id}/approuver`, {})
        await Promise.all([refetchArticles(), refetchMouvements(), refetchDemandes()])
        return demande
      },

      async rejeterDemande(id, motifRejet) {
        const demande = await http.patch(`/demandes/${id}/rejeter`, { motifRejet })
        await refetchDemandes()
        return demande
      },

      async addProgramme(input) {
        const programme = await http.post('/programmes', input)
        await refetchProgrammes()
        return programme
      },

      async updateProgramme(id, patch) {
        await http.patch(`/programmes/${id}`, patch)
        await refetchProgrammes()
      },

      async addMembreProgramme(programmeId, userId) {
        await http.post(`/programmes/${programmeId}/membres`, { userId })
        await refetchProgrammes()
      },

      async removeMembreProgramme(programmeId, userId) {
        await http.delete(`/programmes/${programmeId}/membres/${userId}`)
        await refetchProgrammes()
      },
    }
  }, [state, loading])

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData doit être utilisé dans AppDataProvider')
  return ctx
}
