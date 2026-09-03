import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { toPublicUser } from '../lib/serialize.js'
import { generateTempPassword } from '../lib/password.js'
import { sendMail, loginUrl } from '../lib/mailer.js'
import { compteCreeEmail, motDePasseReinitialiseEmail } from '../lib/emailTemplates.js'

const router = Router()
router.use(requireAuth)
router.use(requirePasswordChanged)

// Lecture ouverte à tous les rôles authentifiés : findUser() est utilisé
// dans les vues gestionnaire/utilisateur pour afficher des noms (demandeur,
// traitant...), pas seulement dans l'espace admin.
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ include: { programmes: true }, orderBy: { nom: 'asc' } })
  res.json(users.map(toPublicUser))
})

router.use(requireRole('admin'))

async function validProgrammeIds(programmeIds) {
  if (!Array.isArray(programmeIds) || programmeIds.length === 0) return []
  const found = await prisma.programme.findMany({ where: { id: { in: programmeIds } }, select: { id: true } })
  return found.map((p) => p.id)
}

router.post('/', async (req, res) => {
  const { nom, email, poste, role, programmeIds } = req.body || {}
  if (!nom || !email || !poste || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' })
  }
  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée par un autre compte.' })

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)
  const ids = await validProgrammeIds(programmeIds)
  const user = await prisma.user.create({
    data: {
      nom,
      email: normalizedEmail,
      poste,
      role,
      passwordHash,
      actif: true,
      mustChangePassword: true,
      programmes: { create: ids.map((programmeId) => ({ programmeId })) },
    },
    include: { programmes: true },
  })

  const { subject, html } = compteCreeEmail({ nom, email: normalizedEmail, tempPassword, url: loginUrl() })
  const emailSent = await sendMail({ to: normalizedEmail, subject, html })

  res.status(201).json({ ...toPublicUser(user), ...(emailSent ? {} : { temporaryPassword: tempPassword }) })
})

router.patch('/:id', async (req, res) => {
  const { nom, email, poste, role, programmeIds } = req.body || {}
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } })
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée par un autre compte.' })
    }
  }

  if (programmeIds !== undefined) {
    const ids = await validProgrammeIds(programmeIds)
    await prisma.programmeMembre.deleteMany({ where: { userId: req.params.id, programmeId: { notIn: ids } } })
    await prisma.programmeMembre.createMany({
      data: ids.map((programmeId) => ({ programmeId, userId: req.params.id })),
      skipDuplicates: true,
    })
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { nom, email: email ? String(email).trim().toLowerCase() : undefined, poste, role },
    include: { programmes: true },
  })
  res.json(toPublicUser(user))
})

router.patch('/:id/status', async (req, res) => {
  const { actif } = req.body || {}
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Impossible de modifier le statut de votre propre compte.' })
  }
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { actif: !!actif } })
  res.json(toPublicUser(user))
})

router.patch('/:id/password', async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash, mustChangePassword: true },
  })

  const { subject, html } = motDePasseReinitialiseEmail({ nom: target.nom, tempPassword, url: loginUrl() })
  const emailSent = await sendMail({ to: target.email, subject, html })

  res.json({ ...toPublicUser(user), ...(emailSent ? {} : { temporaryPassword: tempPassword }) })
})

export default router
