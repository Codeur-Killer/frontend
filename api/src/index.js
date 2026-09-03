import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import articlesRoutes from './routes/articles.routes.js'
import mouvementsRoutes from './routes/mouvements.routes.js'
import demandesRoutes from './routes/demandes.routes.js'
import programmesRoutes from './routes/programmes.routes.js'
import metaRoutes from './routes/meta.routes.js'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET doit être défini avec une valeur forte et unique en production.')
  }
  console.warn('Attention : JWT_SECRET utilise une valeur par défaut. À ne jamais utiliser en production.')
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      const err = new Error('Origine non autorisée par la politique CORS.')
      err.status = 403
      callback(err)
    },
  })
)
app.use(express.json({ limit: '1mb' }))

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez plus tard.' },
})

app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/mouvements', mouvementsRoutes)
app.use('/api/demandes', demandesRoutes)
app.use('/api/programmes', programmesRoutes)
app.use('/api', metaRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur.' })
})

const port = process.env.PORT || 4010
app.listen(port, () => console.log(`G-UGP API à l'écoute sur le port ${port}`))
