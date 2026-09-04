# Guide de déploiement — Vercel (frontend) + Render (API + base de données)

Alternative à `DEPLOIEMENT.md` (VPS + Docker Compose) : ici, aucun serveur à
administrer. Vercel héberge le frontend, Render héberge l'API et la base de
données Postgres. Les deux plateformes offrent HTTPS automatique et un
sous-domaine gratuit (`*.vercel.app`, `*.onrender.com`), donc pas besoin de
nom de domaine pour commencer.

**Différence importante avec le guide VPS** : le frontend et l'API vivent
sur deux domaines différents. Il n'y a donc plus de proxy commun (Caddy) —
le frontend appelle l'API en cross-origin, ce qui veut dire configurer
`CORS_ORIGIN` correctement (déjà en place dans le code) plutôt que de s'en
passer via un domaine unique.

---

## 0. Prérequis

- Un compte [GitHub](https://github.com), [Vercel](https://vercel.com) et
  [Render](https://render.com) (les trois ont une offre gratuite suffisante
  pour démarrer).
- Le projet doit être sur GitHub : Vercel et Render se connectent à un dépôt
  git pour déployer automatiquement à chaque `git push`. Ce dossier n'est
  pas encore un dépôt git — initialisez-le et poussez-le avant de continuer :

```bash
cd "c:\Users\PURS\Downloads\g-ugp"
git init
git add .
git commit -m "Initial commit"
# Créez un dépôt vide sur github.com, puis :
git remote add origin https://github.com/<votre-compte>/g-ugp.git
git branch -M main
git push -u origin main
```

`.gitignore` exclut déjà `.env`, `node_modules` et `dist` — vérifiez avec
`git status` avant de commit que rien de sensible ne s'y glisse.

---

## 1. Créer la base de données sur Render

1. Dashboard Render → **New** → **PostgreSQL**.
2. Nom (ex. `gugp-db`), région la plus proche de vos utilisateurs, plan
   Free pour commencer.
3. Une fois créée, notez deux URLs sur sa page :
   - **Internal Database URL** — utilisée par l'API (même réseau Render,
     plus rapide, ne fonctionne que si l'API tourne aussi sur Render).
   - **External Database URL** — utilisée depuis votre machine pour lancer
     le seed initial (étape 3).

⚠️ Le plan gratuit de Render Postgres est supprimé après 90 jours
d'inactivité. Passez sur un plan payant avant d'ouvrir le service à de
vrais utilisateurs.

---

## 2. Déployer l'API sur Render

1. Dashboard Render → **New** → **Web Service** → connectez le dépôt GitHub.
2. **Root Directory** : `api` (l'API vit dans ce sous-dossier).
3. **Runtime** : Docker — Render détecte automatiquement `api/Dockerfile`.
   L'image applique déjà les migrations au démarrage
   (`docker-entrypoint.sh` → `prisma migrate deploy`), rien à faire de plus
   pour le schéma.
4. **Health Check Path** : `/api/health`.
5. Variables d'environnement (Render → Environment) :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | l'Internal Database URL de l'étape 1 |
   | `JWT_SECRET` | générez-en un fort : `openssl rand -base64 48` |
   | `CORS_ORIGIN` | laissez vide pour l'instant, à renseigner à l'étape 5 |
   | `APP_URL` | idem, à renseigner à l'étape 5 |
   | `SMTP_HOST` | `smtp-relay.brevo.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | votre login SMTP Brevo |
   | `SMTP_PASS` | votre clé SMTP Brevo |
   | `SMTP_FROM` | `G-UGP <no-reply@votre-domaine.com>` |
   | `VAPID_PUBLIC_KEY` | générez la paire avec `cd api && npx web-push generate-vapid-keys` |
   | `VAPID_PRIVATE_KEY` | idem, l'autre valeur de la même paire |
   | `VAPID_SUBJECT` | `mailto:contact@votre-domaine.com` |

   Notez bien la `VAPID_PUBLIC_KEY` générée : elle sera aussi nécessaire
   côté Vercel à l'étape 4 (`VITE_VAPID_PUBLIC_KEY`, même valeur exacte —
   sinon les abonnements aux notifications push échouent en silence).

   Ne définissez **pas** `PORT` — Render l'injecte automatiquement et
   l'application le respecte déjà (`process.env.PORT`).

6. Déployez. Une fois en ligne, notez l'URL Render (ex.
   `https://gugp-api.onrender.com`).

---

## 3. Migrer et peupler la base

Les migrations s'appliquent déjà automatiquement au démarrage du service
(étape 2). Il reste à charger les données de démonstration, depuis votre
machine, en pointant temporairement vers la base Render :

```bash
cd api
DATABASE_URL="<External Database URL de l'étape 1>" node prisma/seed.js
```

(Sous PowerShell : `$env:DATABASE_URL="..."; node prisma/seed.js`.)

Comme pour le guide VPS, changez les mots de passe de démo avant d'ouvrir
l'accès à de vrais utilisateurs.

---

## 4. Déployer le frontend sur Vercel

Le dépôt GitHub utilisé par Vercel est déjà le dossier du frontend. Laissez
**Root Directory** vide (ou utilisez la racine du dépôt). Vercel utilisera
ainsi directement le `package.json`, `index.html` et `vite.config.js` présents
à la racine et exécutera `npm run build` avec Node 22.

Le fichier `vercel.json` est à la racine du dépôt; il est nécessaire pour que les routes React
Router (ex. `/gestion/articles`) ne renvoient pas une 404 au rafraîchissement :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Puis :

1. Dashboard Vercel → **Add New** → **Project** → importez le dépôt GitHub.
2. Laissez **Root Directory** vide, puisque ce dépôt contient déjà le frontend.
  Si `gugp-front` est encore affiché, supprimez cette valeur puis cliquez sur
  **Save** avant de relancer le déploiement.
3. Vercel détecte Vite automatiquement (`npm run build`, dossier `dist`) et utilise Node 22 grâce au champ `engines`.
4. Variables d'environnement :

   | Variable | Valeur |
   |---|---|
   | `VITE_API_URL` | `https://gugp-api.onrender.com/api` (l'URL Render de l'étape 2, avec `/api` à la fin) |
   | `VITE_VAPID_PUBLIC_KEY` | exactement la même valeur que `VAPID_PUBLIC_KEY` sur Render (étape 2) |

5. Déployez. Notez l'URL Vercel (ex. `https://g-ugp.vercel.app`).

---

## 5. Reboucler le CORS

Retournez sur Render (service API) → Environment, et renseignez maintenant :

| Variable | Valeur |
|---|---|
| `CORS_ORIGIN` | `https://g-ugp.vercel.app` (l'URL Vercel de l'étape 4) |
| `APP_URL` | la même URL — utilisée dans le lien de connexion des e-mails |

Sauvegardez : Render redéploie automatiquement le service avec les
nouvelles variables.

---

## 6. Vérifications

- Ouvrez l'URL Vercel, connectez-vous avec un compte de démo.
- Rechargez une page interne (ex. `/gestion/articles`) — ne doit pas
  donner de 404 (confirme que `vercel.json` fonctionne).
- Vérifiez l'icône d'installation PWA dans la barre d'adresse (HTTPS
  automatique sur Vercel, donc ça doit fonctionner directement).
- Créez un compte test et vérifiez la réception de l'e-mail Brevo.
- Ouvrez `https://gugp-api.onrender.com/api/health` directement — doit
  répondre `{"ok":true}`.

---

## Mises à jour futures

Un `git push` sur la branche déployée suffit : Vercel et Render
redéploient chacun automatiquement leur partie.

---

## Limites des plans gratuits à connaître

- **Render Web Service (Free)** : se met en veille après 15 minutes
  d'inactivité — le premier appel après une pause peut prendre 30 à 60
  secondes le temps que le service redémarre. Gênant pour un usage réel ;
  passez sur un plan payant (à partir de quelques dollars/mois) pour
  éviter ça. Ça affecte aussi les notifications (direct + push) : si le
  service était en veille, la demande qui déclenche la notification le
  réveille d'abord, donc la notification part bien mais avec ce même
  délai de 30-60s au lieu d'être instantanée. La connexion en direct (SSE)
  se coupe aussi à chaque mise en veille — le navigateur du gestionnaire
  la rétablit automatiquement, sans action requise, mais avec le même délai.
- **Render PostgreSQL (Free)** : supprimée après 90 jours. À surveiller ou
  à passer sur un plan payant avant que ça arrive.
- **Vercel (Free)** : largement suffisant pour un frontend statique, pas
  de limite bloquante à ce niveau d'usage.

Si le service doit rester réactif en permanence pour de vrais
utilisateurs, le guide VPS (`DEPLOIEMENT.md`) évite ce problème de mise en
veille — à réévaluer selon votre budget et le nombre d'utilisateurs.
