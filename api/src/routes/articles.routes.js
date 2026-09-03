import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { nextArticleReference } from '../lib/numbering.js'
import { programmeIdsForUser, userHasProgrammeAccess } from '../lib/programmeAccess.js'

const router = Router()
router.use(requireAuth)
router.use(requirePasswordChanged)

router.get('/', async (req, res) => {
  const ids = await programmeIdsForUser(req.user)
  const articles = await prisma.article.findMany({
    where: ids === null ? undefined : { programmeId: { in: ids } },
    orderBy: { dateCreation: 'desc' },
  })
  res.json(articles)
})

router.post('/', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const { designation, categorie, unite, stock, seuil, programmeId } = req.body || {}
  if (!designation || !categorie || !unite || !programmeId) {
    return res.status(400).json({ message: 'Désignation, catégorie, unité et programme sont requis.' })
  }
  if (!(await userHasProgrammeAccess(req.user, programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  const existing = await prisma.article.findMany({ select: { reference: true } })
  const article = await prisma.article.create({
    data: {
      reference: nextArticleReference(existing),
      designation,
      categorie,
      unite,
      stock: Number(stock) || 0,
      seuil: Number(seuil) || 0,
      statut: 'disponible',
      programmeId,
    },
  })
  res.status(201).json(article)
})

router.patch('/:id', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const current = await prisma.article.findUnique({ where: { id: req.params.id } })
  if (!current) return res.status(404).json({ message: 'Article introuvable.' })
  if (!(await userHasProgrammeAccess(req.user, current.programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  const { designation, categorie, unite, stock, seuil } = req.body || {}
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      designation,
      categorie,
      unite,
      stock: stock === undefined ? undefined : Number(stock),
      seuil: seuil === undefined ? undefined : Number(seuil),
    },
  })
  res.json(article)
})

router.patch('/:id/status', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const current = await prisma.article.findUnique({ where: { id: req.params.id } })
  if (!current) return res.status(404).json({ message: 'Article introuvable.' })
  if (!(await userHasProgrammeAccess(req.user, current.programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { statut: current.statut === 'disponible' ? 'desactive' : 'disponible' },
  })
  res.json(article)
})

export default router
