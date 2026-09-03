import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { toPublicDemande } from '../lib/serialize.js'
import { nextDemandeNumero, nextBonNumero } from '../lib/numbering.js'
import { programmeIdsForUser, userHasProgrammeAccess } from '../lib/programmeAccess.js'

const router = Router()
router.use(requireAuth)
router.use(requirePasswordChanged)

router.get('/', async (req, res) => {
  let where = {}
  if (req.user.role === 'utilisateur') {
    // Une demande reste consultable par son auteur même si son accès au
    // programme a été retiré depuis : c'est son historique personnel.
    where = { demandeurId: req.user.id }
  } else {
    const ids = await programmeIdsForUser(req.user)
    if (ids !== null) where = { programmeId: { in: ids } }
  }
  const demandes = await prisma.demande.findMany({
    where,
    include: { lignes: true, programme: true },
    orderBy: { date: 'desc' },
  })
  res.json(demandes.map(toPublicDemande))
})

router.post('/', async (req, res) => {
  const { lignes, motif } = req.body || {}
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return res.status(400).json({ message: 'Au moins un article est requis.' })
  }
  if (lignes.some((l) => !l.articleId || !Number.isFinite(Number(l.quantite)) || Number(l.quantite) <= 0)) {
    return res.status(400).json({ message: 'Chaque ligne doit avoir un article et une quantité positive.' })
  }
  const articleIds = [...new Set(lignes.map((l) => l.articleId))]
  const foundArticles = await prisma.article.findMany({ where: { id: { in: articleIds } } })
  if (foundArticles.length !== articleIds.length) {
    return res.status(400).json({ message: 'Un ou plusieurs articles sont introuvables.' })
  }
  const programmeIds = [...new Set(foundArticles.map((a) => a.programmeId))]
  if (programmeIds.length > 1) {
    return res.status(400).json({ message: 'Une demande ne peut porter que sur les articles d\'un seul programme.' })
  }
  const programmeId = programmeIds[0]
  if (!(await userHasProgrammeAccess(req.user, programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }

  const existing = await prisma.demande.findMany({ select: { numero: true } })
  const numero = nextDemandeNumero(existing, new Date().getFullYear())

  const demande = await prisma.demande.create({
    data: {
      numero,
      demandeurId: req.user.id,
      programmeId,
      motif: motif || '',
      statut: 'en_attente',
      lignes: { create: lignes.map((l) => ({ articleId: l.articleId, quantite: Number(l.quantite) })) },
    },
    include: { lignes: true, programme: true },
  })
  res.status(201).json(toPublicDemande(demande))
})

router.patch('/:id/approuver', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const demande = await prisma.demande.findUnique({
    where: { id: req.params.id },
    include: { lignes: true, demandeur: true },
  })
  if (!demande) return res.status(404).json({ message: 'Demande introuvable.' })
  if (!(await userHasProgrammeAccess(req.user, demande.programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  if (demande.statut !== 'en_attente') return res.status(400).json({ message: 'Cette demande a déjà été traitée.' })

  const existingDemandes = await prisma.demande.findMany({ select: { bonNumero: true } })
  const bonNumero = nextBonNumero(existingDemandes, new Date().getFullYear())
  const now = new Date()

  const quantiteParArticle = new Map()
  demande.lignes.forEach((l) => quantiteParArticle.set(l.articleId, (quantiteParArticle.get(l.articleId) || 0) + l.quantite))
  const articles = await prisma.article.findMany({ where: { id: { in: [...quantiteParArticle.keys()] } } })

  const [, , updated] = await prisma.$transaction([
    ...articles.map((article) =>
      prisma.article.update({
        where: { id: article.id },
        data: { stock: Math.max(0, article.stock - quantiteParArticle.get(article.id)) },
      })
    ),
    prisma.mouvement.createMany({
      data: demande.lignes.map((ligne) => ({
        type: 'sortie',
        articleId: ligne.articleId,
        quantite: ligne.quantite,
        date: now,
        beneficiaire: demande.demandeur.poste,
        document: bonNumero,
        utilisateurId: req.user.id,
        observation: `Sortie liée à ${demande.numero}`,
      })),
    }),
    prisma.demande.update({
      where: { id: demande.id },
      data: { statut: 'approuvee', traiteParId: req.user.id, dateTraitement: now, bonNumero },
      include: { lignes: true, programme: true },
    }),
  ])

  res.json(toPublicDemande(updated))
})

router.patch('/:id/rejeter', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const { motifRejet } = req.body || {}
  if (!motifRejet || !motifRejet.trim()) return res.status(400).json({ message: 'Le motif du rejet est requis.' })

  const demande = await prisma.demande.findUnique({ where: { id: req.params.id } })
  if (!demande) return res.status(404).json({ message: 'Demande introuvable.' })
  if (!(await userHasProgrammeAccess(req.user, demande.programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  if (demande.statut !== 'en_attente') return res.status(400).json({ message: 'Cette demande a déjà été traitée.' })

  const updated = await prisma.demande.update({
    where: { id: req.params.id },
    data: { statut: 'rejetee', traiteParId: req.user.id, dateTraitement: new Date(), motifRejet: motifRejet.trim() },
    include: { lignes: true, programme: true },
  })
  res.json(toPublicDemande(updated))
})

export default router
