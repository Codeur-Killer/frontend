import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Authentification requise.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.actif) return res.status(401).json({ message: 'Session invalide.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée.' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Vous n'avez pas les droits pour cette action." })
    }
    next()
  }
}

// Bloque l'accès aux données métier tant qu'un mot de passe temporaire n'a
// pas été changé — sans ça, un mot de passe temporaire intercepté suffirait
// à consulter/modifier de vraies données avant même le changement forcé.
export function requirePasswordChanged(req, res, next) {
  if (req.user.mustChangePassword) {
    return res.status(403).json({ message: 'Vous devez changer votre mot de passe avant de continuer.', mustChangePassword: true })
  }
  next()
}
