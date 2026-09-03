export function compteCreeEmail({ nom, email, tempPassword, url }) {
  return {
    subject: 'Votre compte G-UGP a été créé',
    html: `
      <p>Bonjour ${nom},</p>
      <p>Un compte a été créé pour vous sur G-UGP (Gestion des stocks et expressions de besoin).</p>
      <p>
        Adresse e-mail : <strong>${email}</strong><br>
        Mot de passe temporaire : <strong>${tempPassword}</strong>
      </p>
      <p><a href="${url}">Se connecter</a></p>
      <p>Vous devrez choisir un nouveau mot de passe dès votre première connexion.</p>
    `,
  }
}

export function motDePasseReinitialiseEmail({ nom, tempPassword, url }) {
  return {
    subject: 'Votre mot de passe G-UGP a été réinitialisé',
    html: `
      <p>Bonjour ${nom},</p>
      <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
      <p>Nouveau mot de passe temporaire : <strong>${tempPassword}</strong></p>
      <p><a href="${url}">Se connecter</a></p>
      <p>Vous devrez choisir un nouveau mot de passe dès votre prochaine connexion.</p>
    `,
  }
}
