import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { programmeIdsForUser, userHasProgrammeAccess } from '../lib/programmeAccess.js'

const router = Router()
router.use(requireAuth)
router.use(requirePasswordChanged)

router.get('/', async (req, res) => {
  const ids = await programmeIdsForUser(req.user)
  const mouvements = await prisma.mouvement.findMany({
    where: ids === null ? undefined : { article: { programmeId: { in: ids } } },
    orderBy: { date: 'desc' },
  })
  res.json(mouvements)
})

router.post('/', requireRole('gestionnaire', 'admin'), async (req, res) => {
  const { type, articleId, quantite, date, provenance, beneficiaire, document, observation } = req.body || {}
  if (!type || !articleId || !quantite) {
    return res.status(400).json({ message: 'Type, article et quantité sont requis.' })
  }
  if (!Number.isFinite(Number(quantite)) || Number(quantite) <= 0) {
    return res.status(400).json({ message: 'La quantité doit être un nombre positif.' })
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) return res.status(404).json({ message: 'Article introuvable.' })
  if (!(await userHasProgrammeAccess(req.user, article.programmeId))) {
    return res.status(403).json({ message: "Vous n'avez pas accès à ce programme." })
  }
  if (type === 'sortie' && quantite > article.stock) {
    return res.status(400).json({ message: 'La quantité demandée dépasse le stock disponible.' })
  }

  const [mouvement] = await prisma.$transaction([
    prisma.mouvement.create({
      data: {
        type,
        articleId,
        quantite: Number(quantite),
        date: date ? new Date(date) : new Date(),
        provenance,
        beneficiaire,
        document,
        utilisateurId: req.user.id,
        observation: observation || '',
      },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { stock: type === 'entree' ? article.stock + Number(quantite) : article.stock - Number(quantite) },
    }),
  ])

  res.status(201).json(mouvement)
})

export default router
