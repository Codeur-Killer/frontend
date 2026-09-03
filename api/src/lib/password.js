import crypto from 'node:crypto'

// Alphabet sans caractères ambigus (0/O, 1/l/I) pour rester lisible si un
// administrateur doit le retaper manuellement en repli sans e-mail.
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function generateTempPassword(length = 12) {
  return Array.from(crypto.randomBytes(length))
    .map((b) => CHARS[b % CHARS.length])
    .join('')
}
