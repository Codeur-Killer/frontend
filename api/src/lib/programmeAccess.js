import { prisma } from '../db.js'

// L'admin voit et gère tous les programmes. Un gestionnaire ou un
// utilisateur n'a accès qu'aux programmes auxquels il a été rattaché.
export async function programmeIdsForUser(user) {
  if (user.role === 'admin') return null // null = pas de restriction
  const membres = await prisma.programmeMembre.findMany({
    where: { userId: user.id },
    select: { programmeId: true },
  })
  return membres.map((m) => m.programmeId)
}

export async function userHasProgrammeAccess(user, programmeId) {
  if (user.role === 'admin') return true
  const membre = await prisma.programmeMembre.findUnique({
    where: { programmeId_userId: { programmeId, userId: user.id } },
  })
  return !!membre
}
