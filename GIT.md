# Git — structure et déploiement

Ce projet n'a pas encore de dépôt git. Ce guide couvre à la fois la mise en
place initiale et les règles à suivre ensuite, pour que l'historique reste
propre et que les déploiements (`DEPLOIEMENT.md`, `DEPLOIEMENT-VERCEL-RENDER.md`)
se déclenchent sans surprise.

---

## 1. Mise en place initiale

```bash
cd "c:\Users\PURS\Downloads\g-ugp-frontend\g-ugp"
git init
git add .
git status   # relire la liste avant de commit — voir section 4
git commit -m "chore: commit initial"
git branch -M main
```

Créez ensuite un dépôt **vide** sur GitHub (ne pas cocher "Add README" ni
"Add .gitignore" — ce projet en a déjà) puis :

```bash
git remote add origin https://github.com/<votre-compte>/g-ugp.git
git push -u origin main
```

`main` devient la branche de référence : c'est elle que Vercel et Render
surveillent pour déployer automatiquement (voir `DEPLOIEMENT-VERCEL-RENDER.md`),
et c'est elle que vous `git pull` sur le VPS pour mettre à jour une
installation Docker Compose (voir `DEPLOIEMENT.md`).

---

## 2. Ce qui doit être suivi par git — et ce qui ne doit pas l'être

| Toujours commité | Jamais commité (déjà dans `.gitignore`) |
|---|---|
| Code source (`src/`, `api/src/`) | `node_modules/` |
| `api/prisma/schema.prisma` | `dist/` (regénéré à chaque build) |
| `api/prisma/migrations/` — **y compris chaque dossier de migration**, même généré par Prisma | `.env`, `.env.local` et toute variante (secrets) |
| `api/prisma/seed.js` | Logs |

Point d'attention : **les migrations Prisma ne sont pas du code généré
jetable.** Elles forment l'historique du schéma de la base — les
supprimer ou les recréer casse `prisma migrate deploy` sur toute base déjà
existante (production incluse). Elles se commitent, se relisent, et ne se
réécrivent jamais après coup.

`.env.example` (et `.env.production.example`) sont l'exception : ce sont
des modèles sans secret réel, faits pour être commités — c'est ce qui
documente quelles variables sont attendues, sans jamais exposer leur
valeur.

---

## 3. Branches

Pour la taille de ce projet, un modèle simple suffit — pas besoin de
`develop`/`release`/`hotfix` séparés :

- **`main`** — toujours déployable. C'est la branche que Vercel et Render
  construisent automatiquement. On n'y pousse jamais directement de code
  non testé.
- **Branches de travail**, une par changement, nommées par intention :
  - `feat/...` — nouvelle fonctionnalité (ex. `feat/programme-scoping`)
  - `fix/...` — correction de bug (ex. `fix/cors-brevo`)
  - `chore/...` — maintenance sans changement fonctionnel (dépendances, config)
  - `docs/...` — documentation seule

```bash
git checkout -b feat/nom-du-changement
# ... travail, commits ...
git push -u origin feat/nom-du-changement
```

Ouvrez ensuite une Pull Request vers `main` sur GitHub plutôt que de
fusionner en local — ça laisse une trace de ce qui a changé et pourquoi,
et **Vercel génère automatiquement une URL de prévisualisation pour
chaque PR** : vous pouvez tester le frontend en conditions réelles avant
de fusionner, sans toucher à la production. (Render ne fait pas ça sur le
plan gratuit — testez l'API en local via Docker avant de fusionner, comme
déjà fait tout au long de ce projet.)

Une fois la PR relue et les vérifications faites, fusionnez dans `main` :
Vercel et Render redéploient automatiquement.

---

## 4. Avant chaque commit

- `git status` — vérifiez qu'aucun fichier inattendu ne s'y trouve
  (spécialement si vous avez ajouté un nouveau fichier `.env*` ou une
  clé quelque part par erreur — `.gitignore` protège les noms connus,
  pas un secret collé dans un fichier suivi par erreur).
- `git diff --staged` pour les changements sensibles (migrations,
  `docker-compose.yml`, fichiers de config) — relire avant d'envoyer.
- Un commit = un changement cohérent. Préférez plusieurs petits commits
  à un seul commit fourre-tout — ça facilite `git revert` si un
  changement précis doit être annulé plus tard sans toucher au reste.

---

## 5. Convention de message de commit

Format court, basé sur [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
<type>: <résumé au présent, sans majuscule ni point final>
```

Types utilisés dans ce projet :

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité visible (page, endpoint, comportement) |
| `fix` | Correction de bug |
| `refactor` | Changement de structure sans changement de comportement |
| `docs` | Documentation seule (`.md`, commentaires) |
| `chore` | Dépendances, configuration, tâches de maintenance |
| `security` | Correctif ou durcissement de sécurité |

Exemples tirés de l'historique réel de ce projet :

```
feat: ajoute la gestion des programmes et le cloisonnement des accès
security: ajoute le rate-limiting et helmet sur l'API
fix: corrige le port de l'api en conflit avec l'ancien projet
docs: ajoute le guide de déploiement Vercel + Render
```

Le corps du message (ligne vide puis texte libre) est utile pour expliquer
le *pourquoi* d'un changement non évident — pas pour répéter ce que le
diff montre déjà.

---

## 6. Étiqueter une version déployée (optionnel mais recommandé)

Avant un déploiement important, ou simplement pour retrouver facilement
un point de repère dans l'historique :

```bash
git tag -a v1.0.0 -m "Première mise en production"
git push origin v1.0.0
```

Utile en cas de problème post-déploiement : `git checkout v1.0.0` retrouve
exactement l'état du code à ce moment-là, pour comparer ou revenir en
arrière rapidement.

---

## 7. Revenir en arrière après un déploiement problématique

- **Frontend (Vercel)** : dans le dashboard Vercel, chaque déploiement
  passé reste disponible — "Promote to Production" sur un déploiement
  antérieur suffit, sans toucher à git.
- **API (Render)** : "Manual Deploy" → choisir un commit antérieur dans
  l'historique, ou `git revert <commit>` + push pour créer un nouveau
  commit qui annule le précédent (préférable à `git reset --hard` sur une
  branche déjà poussée, qui réécrit l'historique partagé).
- **VPS (Docker Compose)** : `git checkout <commit-ou-tag>` sur le
  serveur puis rejouer les étapes de build de `DEPLOIEMENT.md`.
