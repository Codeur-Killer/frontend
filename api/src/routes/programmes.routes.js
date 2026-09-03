import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { programmeIdsForUser } from '../lib/programmeAccess.js'
import { toPublicUser } from '../lib/serialize.js'

const router = Router()
router.use(requireAuth)
router.use(requirePasswordChanged)

const membreInclude = {
  membres: { include: { user: true } },
}

function toPublicProgramme(programme) {
  const { membres, ...rest } = programme
  return {
    ...rest,
    membres: membres.map((m) => ({ userId: m.userId, user: toPublicUser(m.user) })),
  }
}

router.get('/', async (req, res) => {
  const ids = await programmeIdsForUser(req.user)
  const programmes = await prisma.programme.findMany({
    where: ids === null ? undefined : { id: { in: ids } },
    include: membreInclude,
    orderBy: { nom: 'asc' },
  })
  res.json(programmes.map(toPublicProgramme))
})

router.use(requireRole('admin'))

router.post('/', async (req, res) => {
  const { nom, code } = req.body || {}
  if (!nom) return res.status(400).json({ message: 'Le nom du programme est requis.' })
  if (code) {
    const existing = await prisma.programme.findUnique({ where: { code } })
    if (existing) return res.status(409).json({ message: 'Ce code de programme est déjà utilisé.' })
  }
  const programme = await prisma.programme.create({
    data: { nom, code: code || null },
    include: membreInclude,
  })
  res.status(201).json(toPublicProgramme(programme))
})

router.patch('/:id', async (req, res) => {
  const { nom, code, actif } = req.body || {}
  if (code) {
    const existing = await prisma.programme.findUnique({ where: { code } })
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ message: 'Ce code de programme est déjà utilisé.' })
    }
  }
  const programme = await prisma.programme.update({
    where: { id: req.params.id },
    data: { nom, code: code || undefined, actif },
    include: membreInclude,
  })
  res.json(toPublicProgramme(programme))
})

router.post('/:id/membres', async (req, res) => {
  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ message: 'Un utilisateur est requis.' })

  const [programme, user] = await Promise.all([
    prisma.programme.findUnique({ where: { id: req.params.id } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])
  if (!programme) return res.status(404).json({ message: 'Programme introuvable.' })
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  const existing = await prisma.programmeMembre.findUnique({
    where: { programmeId_userId: { programmeId: req.params.id, userId } },
  })
  if (existing) return res.status(409).json({ message: 'Cet utilisateur est déjà membre de ce programme.' })

  await prisma.programmeMembre.create({ data: { programmeId: req.params.id, userId } })
  const updated = await prisma.programme.findUnique({ where: { id: req.params.id }, include: membreInclude })
  res.status(201).json(toPublicProgramme(updated))
})

router.delete('/:id/membres/:userId', async (req, res) => {
  const existing = await prisma.programmeMembre.findUnique({
    where: { programmeId_userId: { programmeId: req.params.id, userId: req.params.userId } },
  })
  if (!existing) return res.status(404).json({ message: 'Cet utilisateur n\'est pas membre de ce programme.' })

  await prisma.programmeMembre.delete({ where: { id: existing.id } })
  const updated = await prisma.programme.findUnique({ where: { id: req.params.id }, include: membreInclude })
  res.json(toPublicProgramme(updated))
})

export default router
