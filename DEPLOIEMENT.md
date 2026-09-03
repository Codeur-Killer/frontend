# Guide de déploiement en production — G-UGP

Ce guide part d'un serveur Linux vierge (VPS) et va jusqu'à une application
accessible en HTTPS avec certificat automatique, PWA installable, et API/DB
non exposées publiquement.

Fichiers concernés (déjà présents dans le repo) :
- `docker-compose.yml` — services de base (db, api, adminer)
- `docker-compose.prod.yml` — surcouche production (ferme les ports sensibles, ajoute Caddy)
- `Caddyfile` — reverse proxy + HTTPS automatique + sert le frontend buildé
- `.env.production.example` — modèle pour le build du frontend

---

## 0. Prérequis

- Un VPS Linux (Ubuntu 22.04/24.04 recommandé) avec accès SSH root/sudo.
  2 vCPU / 2 Go RAM suffisent largement pour ce projet.
- Un nom de domaine dont vous contrôlez le DNS.
- Créez un enregistrement DNS **A** pointant `votre-domaine.com` vers l'IP
  publique du VPS. Attendez que la propagation soit effective
  (`nslookup votre-domaine.com` doit renvoyer l'IP du serveur) avant l'étape 6 :
  Caddy a besoin que le DNS soit correct pour obtenir le certificat HTTPS.

---

## 1. Sécuriser le serveur

Connectez-vous en SSH, puis :

```bash
apt update && apt upgrade -y

# Un utilisateur non-root dédié au déploiement
adduser deploy
usermod -aG sudo deploy

# Copier votre clé SSH vers ce nouvel utilisateur (depuis votre machine locale)
# ssh-copy-id deploy@votre-serveur

# Pare-feu : seuls SSH, HTTP et HTTPS sont autorisés
apt install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Ensuite, reconnectez-vous en tant que `deploy` (plus jamais en root pour la suite).
Si vous le pouvez, désactivez aussi la connexion SSH par mot de passe dans
`/etc/ssh/sshd_config` (`PasswordAuthentication no`) une fois votre clé confirmée
fonctionnelle, puis `systemctl restart sshd`.

---

## 2. Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# déconnectez-vous / reconnectez-vous pour que le groupe soit pris en compte
docker --version
docker compose version
```

---

## 3. Transférer le projet sur le serveur

Depuis votre machine locale (remplacez par votre méthode : git, ou rsync) :

```bash
# Option simple si vous n'avez pas encore de dépôt git distant :
rsync -avz --exclude node_modules --exclude dist --exclude .git \
  "c:/Users/PURS/Downloads/g-ugp-frontend/g-ugp/" deploy@votre-serveur:/home/deploy/g-ugp/
```

(`rsync` fonctionne depuis Git Bash sur Windows. Sinon, `scp -r` fait aussi
l'affaire pour un premier envoi.)

---

## 4. Configurer les secrets de production

**Ne réutilisez jamais les secrets de développement.** Sur le serveur :

```bash
cd /home/deploy/g-ugp

# Génère un secret JWT fort et unique pour la prod
JWT_SECRET=$(openssl rand -base64 48)
# Génère un mot de passe DB fort
DB_PASSWORD=$(openssl rand -base64 24)

cat > .env <<EOF
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=https://votre-domaine.com
APP_URL=https://votre-domaine.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre-login-smtp-brevo
SMTP_PASS=votre-cle-smtp-brevo
SMTP_FROM=G-UGP <no-reply@votre-domaine.com>
EOF

echo "Mot de passe DB généré : $DB_PASSWORD  (notez-le, ne le perdez pas)"
```

L'envoi d'e-mails (création de compte, réinitialisation de mot de passe)
utilise [Brevo](https://app.brevo.com) en relais SMTP :

1. Créez un compte Brevo (l'offre gratuite suffit largement pour ce volume).
2. Dans **Senders, Domains & Dedicated IPs → Senders**, ajoutez et validez
   l'adresse utilisée comme `SMTP_FROM` (Brevo refuse d'envoyer depuis une
   adresse non vérifiée).
3. Dans **SMTP & API → SMTP**, récupérez le "Login" (→ `SMTP_USER`) et
   générez une clé SMTP (→ `SMTP_PASS`, différente du mot de passe de votre
   compte Brevo).

⚠️ **Sans `SMTP_HOST` configuré, aucun e-mail n'est envoyé** : le mot de
passe temporaire est alors renvoyé dans la réponse de l'API et affiché à
l'admin dans l'interface — pratique en développement, mais à éviter en
production puisque le mot de passe transite alors uniquement via l'écran
de l'admin. Configurez Brevo avant d'ouvrir de vrais comptes.

Puis éditez `docker-compose.yml` pour remplacer le mot de passe DB de
développement (`gugp`) par celui généré, **aux deux endroits** (service `db`
et `DATABASE_URL` du service `api`) :

```bash
nano docker-compose.yml
```

```yaml
  db:
    environment:
      POSTGRES_PASSWORD: <collez le DB_PASSWORD généré>
  api:
    environment:
      DATABASE_URL: postgresql://gugp:<le même DB_PASSWORD>@db:5432/gugp
```

Éditez aussi `Caddyfile` pour remplacer `votre-domaine.com` par votre vrai domaine.

---

## 5. Builder le frontend pour la production

Pas besoin d'installer Node sur le serveur : on utilise un conteneur jetable.

```bash
cp .env.production.example .env.production
# .env.production contient VITE_API_URL=/api : le frontend appelle l'API
# sur le même domaine via Caddy, donc aucune configuration CORS complexe
# n'est nécessaire côté navigateur.

docker run --rm -v "$(pwd)":/app -w /app node:20-alpine \
  sh -c "npm ci && npm run build"
```

Le dossier `dist/` généré est ce que Caddy va servir (voir `docker-compose.prod.yml`).

---

## 6. Lancer l'application

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Ceci :
- construit et démarre `db`, `api`, `caddy` ;
- **n'expose pas** `db` sur l'hôte (plus de port 5433 public) ;
- **ne démarre pas** `adminer` (profile `debug`, voir étape 9) ;
- Caddy obtient automatiquement un certificat Let's Encrypt pour votre domaine
  au premier accès HTTPS (le DNS doit déjà pointer vers le serveur — étape 0).

Vérifiez :

```bash
docker compose ps
docker compose logs -f caddy   # doit indiquer l'obtention du certificat
curl -I https://votre-domaine.com/api/health
```

Vous devriez obtenir `{"ok":true}` et un `HTTP/2 200`.

---

## 7. Appliquer les migrations et données initiales

Les migrations Prisma s'appliquent **automatiquement** au démarrage du
conteneur `api` (voir `api/docker-entrypoint.sh` → `prisma migrate deploy`).

Pour peupler la base avec des comptes réels (remplacez le script de seed de
démo, qui contient des mots de passe faibles prévus pour le développement) :

```bash
docker compose exec api node prisma/seed.js
```

⚠️ Une fois les vrais comptes créés, **changez immédiatement** les mots de
passe par défaut du script de seed (`admin2026`, `ugpboad2026`) via
l'interface (Paramètres → Utilisateurs), ou supprimez ces comptes de démo.

---

## 8. Vérifier l'installation PWA

Ouvrez `https://votre-domaine.com` dans Chrome/Edge : une icône d'installation
doit apparaître dans la barre d'adresse. Sur iPad (Safari) : Partager → "Sur
l'écran d'accueil". Le HTTPS de Caddy rend ceci possible (rappel : les PWA ne
s'installent pas en HTTP hors localhost).

---

## 9. Accès de dépannage à Adminer (optionnel, ponctuel)

Adminer reste désactivé par défaut. Pour l'utiliser temporairement :

```bash
# Sur le serveur
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile debug up -d adminer
```

Puis, **depuis votre machine locale**, ouvrez un tunnel SSH plutôt que
d'exposer le port publiquement :

```bash
ssh -L 8081:localhost:8081 deploy@votre-serveur
```

Ouvrez ensuite `http://localhost:8081` dans votre navigateur local. Pensez à
arrêter le conteneur une fois le dépannage terminé :

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop adminer
```

---

## 10. Sauvegardes de la base de données

Script simple de sauvegarde quotidienne :

```bash
mkdir -p /home/deploy/backups

cat > /home/deploy/backup-db.sh <<'EOF'
#!/bin/sh
cd /home/deploy/g-ugp
docker compose exec -T db pg_dump -U gugp gugp | gzip > /home/deploy/backups/gugp-$(date +%F).sql.gz
find /home/deploy/backups -name "*.sql.gz" -mtime +14 -delete
EOF
chmod +x /home/deploy/backup-db.sh

# Cron quotidien à 3h du matin
(crontab -l 2>/dev/null; echo "0 3 * * * /home/deploy/backup-db.sh") | crontab -
```

Pensez à copier périodiquement `/home/deploy/backups` ailleurs que sur le
même serveur (stockage externe, autre machine) — une sauvegarde qui vit sur
le serveur qu'elle est censée protéger n'en est pas vraiment une.

---

## 11. Mettre à jour l'application après un changement de code

```bash
cd /home/deploy/g-ugp

# 1. Récupérer le nouveau code (rsync depuis votre machine, ou git pull)

# 2. Rebuilder le frontend
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine sh -c "npm ci && npm run build"

# 3. Rebuilder et redémarrer les conteneurs concernés
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Recharger Caddy s'il a servi la version précédente en cache navigateur —
#    rien à faire côté serveur, le service worker du PWA gère la mise à jour
#    automatique côté client (registerType: autoUpdate).
```

---

## Checklist finale avant d'annoncer le site en production

- [ ] `https://votre-domaine.com` charge avec un cadenas valide (pas d'avertissement navigateur)
- [ ] `docker compose ps` : `db` et `api` n'ont **aucun port public** listé
- [ ] `adminer` n'est **pas** démarré (`docker compose ps` ne le liste pas)
- [ ] Mots de passe de démo du seed changés ou comptes supprimés
- [ ] `.env` et `docker-compose.yml` (avec les vrais secrets) ne sont **pas** commités dans git
- [ ] Sauvegarde DB testée (`pg_dump` puis restauration sur une base de test)
- [ ] `ufw status` : seuls 22/80/443 sont ouverts
- [ ] `SMTP_HOST` configuré et testé (créer un compte de test et vérifier la réception de l'e-mail)
