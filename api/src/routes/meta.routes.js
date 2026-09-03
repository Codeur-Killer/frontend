import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const categories = ['Fournitures de bureau', 'Informatique', 'Mobilier', 'Entretien', 'Consommables']

router.get('/categories', requireAuth, (req, res) => res.json(categories))

export default router
