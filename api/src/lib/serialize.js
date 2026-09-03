export function toPublicUser(user) {
  const { passwordHash, programmes, ...rest } = user
  return {
    ...rest,
    ...(programmes ? { programmeIds: programmes.map((m) => m.programmeId) } : {}),
  }
}

export function toPublicDemande(demande) {
  const { programme, ...rest } = demande
  return {
    ...rest,
    programmeNom: programme?.nom,
    lignes: (demande.lignes || []).map((l) => ({ articleId: l.articleId, quantite: l.quantite })),
  }
}
