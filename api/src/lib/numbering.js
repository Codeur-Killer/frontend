export const orgInfo = {
  suffixeNumero: 'PC/PURS/CG/UGP-BOAD',
}

function pad(n, size) {
  return String(n).padStart(size, '0')
}

// Numéro de demande (expression de besoin) : EB-{année}-{00000}, séquence annuelle.
export function nextDemandeNumero(demandes, year) {
  const nums = demandes
    .map((d) => d.numero)
    .filter(Boolean)
    .map((n) => parseInt(n.split('-').pop(), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `EB-${year}-${pad(max + 1, 5)}`
}

// Numéro officiel du bon : {séquence continue}/{année}/PC/PURS/CG/UGP-BOAD.
// La séquence n'est jamais réinitialisée par année.
export function nextBonNumero(demandes, year) {
  const nums = demandes
    .map((d) => d.bonNumero)
    .filter(Boolean)
    .map((n) => parseInt(n.split('/')[0], 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${pad(max + 1, 3)}/${year}/${orgInfo.suffixeNumero}`
}

export function nextArticleReference(articles) {
  const nums = articles
    .map((a) => a.reference)
    .filter(Boolean)
    .map((r) => parseInt(r.split('-').pop(), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 100
  return `ART-${pad(max + 1, 6)}`
}
