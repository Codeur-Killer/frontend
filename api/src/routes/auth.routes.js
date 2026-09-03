import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { toPublicUser } from '../lib/serialize.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Adresse e-mail et mot de passe requis.' })
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' })
  }
  if (!user.actif) {
    return res.status(403).json({ message: 'Ce compte a été désactivé. Contactez un administrateur.' })
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: toPublicUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) })
})

router.patch('/me/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' })
  }
  const valid = await bcrypt.compare(currentPassword, req.user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Mot de passe actuel incorrect.' })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash, mustChangePassword: false },
  })
  res.json({ user: toPublicUser(user) })
})

export default router
