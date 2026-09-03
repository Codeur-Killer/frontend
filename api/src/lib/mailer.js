import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL } = process.env

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null

export function loginUrl() {
  return `${APP_URL || 'http://localhost:5173'}/connexion`
}

// Renvoie true si l'e-mail a réellement été envoyé. Si le SMTP n'est pas
// configuré (ex. environnement de développement local), l'appelant doit
// prévoir un repli — ne jamais faire échouer l'action métier pour autant.
export async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.warn(`[mailer] SMTP non configuré — e-mail non envoyé à ${to} ("${subject}").`)
    return false
  }
  try {
    await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject, html })
    return true
  } catch (err) {
    console.error(`[mailer] Échec de l'envoi à ${to} :`, err.message)
    return false
  }
}
