import { CircleCheck, CircleAlert, TriangleAlert, Clock3, XCircle, FileCheck2 } from 'lucide-react'

export function stockLevel(stockActuel, seuil) {
  if (seuil <= 0) return 'normal'
  if (stockActuel <= seuil * 0.5) return 'critique'
  if (stockActuel <= seuil) return 'faible'
  return 'normal'
}

export const stockLevelConfig = {
  critique: {
    label: 'Stock critique',
    color: 'text-danger',
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    icon: TriangleAlert,
  },
  faible: {
    label: 'Stock faible',
    color: 'text-warn',
    dot: 'bg-warn',
    bg: 'bg-warn-bg',
    icon: CircleAlert,
  },
  normal: {
    label: 'Stock normal',
    color: 'text-ok',
    dot: 'bg-ok',
    bg: 'bg-ok-bg',
    icon: CircleCheck,
  },
}

export const demandeStatusConfig = {
  en_attente: {
    label: 'En attente',
    color: 'text-warn',
    dot: 'bg-warn',
    bg: 'bg-warn-bg',
    icon: Clock3,
  },
  approuvee: {
    label: 'Approuvée',
    color: 'text-ok',
    dot: 'bg-ok',
    bg: 'bg-ok-bg',
    icon: CircleCheck,
  },
  rejetee: {
    label: 'Rejetée',
    color: 'text-danger',
    dot: 'bg-danger',
    bg: 'bg-danger-bg',
    icon: XCircle,
  },
}

export const articleStatusConfig = {
  disponible: { label: 'Disponible', color: 'text-ok', dot: 'bg-ok', bg: 'bg-ok-bg' },
  desactive: { label: 'Désactivé', color: 'text-muted', dot: 'bg-muted', bg: 'bg-paper-2' },
}

export const roleConfig = {
  admin: { label: 'Administrateur', color: 'text-gold-2', dot: 'bg-gold', bg: 'bg-warn-bg' },
  gestionnaire: { label: 'Gestionnaire', color: 'text-ok', dot: 'bg-ok', bg: 'bg-ok-bg' },
  utilisateur: { label: 'Utilisateur', color: 'text-muted', dot: 'bg-muted', bg: 'bg-paper-2' },
}

export const userStatusConfig = {
  true: { label: 'Actif', color: 'text-ok', dot: 'bg-ok', bg: 'bg-ok-bg' },
  false: { label: 'Désactivé', color: 'text-danger', dot: 'bg-danger', bg: 'bg-danger-bg' },
}

export const bonIcon = FileCheck2
