# G-UGP - Gestion des stocks et expressions de besoins

Frontend React de l'application G-UGP, construit à partir du cahier des charges fourni. Ce dépôt couvre uniquement l'interface : les données sont simulées côté navigateur (voir plus bas), en attendant le branchement à une vraie API.

## Installation

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`. Depuis l'écran de connexion, choisissez un compte de démonstration (gestionnaire ou utilisateur) pour ouvrir l'espace correspondant.

Pour générer une version de production :

```bash
npm run build
npm run preview
```

## Stack technique

- **React 19** + **React Router 7** pour la navigation entre les deux espaces (utilisateur et gestionnaire)
- **Tailwind CSS v4** pour le système de design, avec les jetons de couleur et de typographie définis dans `src/index.css`
- **Recharts** pour le graphique d'évolution des entrées et sorties du tableau de bord
- **Lucide React** pour les icônes
- **IBM Plex Sans / IBM Plex Mono** (auto-hébergées via `@fontsource`) pour la typographie

## Ce qui est simulé (pas encore de backend)

Le cahier des charges décrit un système complet mais ne précise pas d'API. Pour livrer un frontend fonctionnel et démontrable, les choix suivants ont été faits :

- **Données** : `src/context/AppDataContext.jsx` tient lieu de backend simulé. Les articles, mouvements de stock et expressions de besoin sont d'abord chargés depuis `src/data/mockData.js`, puis toute modification (création d'article, entrée/sortie, soumission ou traitement d'une demande) est conservée dans le `localStorage` du navigateur. Il suffit de remplacer les fonctions de ce fichier par de vrais appels API pour brancher un backend.
- **Connexion** : comme il n'y a pas encore d'authentification réelle, l'écran de connexion propose de choisir un compte de démonstration plutôt que de simuler un mot de passe qui n'existerait pas vraiment. `src/context/AuthContext.jsx` est le point à remplacer par une vraie authentification.
- **Approbation d'une demande** : approuver une expression de besoin génère automatiquement le numéro de bon, crée les mouvements de sortie correspondants et met à jour le stock, conformément au scénario décrit dans le cahier des charges (section 18).
- **Export** : le bouton "Exporter en CSV" produit un vrai fichier téléchargeable (compatible Excel). Le bouton "Imprimer en PDF" ouvre la boîte d'impression du navigateur sur la liste filtrée ; c'est aussi ce mécanisme qui sert à imprimer les bons de sortie.

## Structure du projet

```
src/
  context/       AuthContext (session) et AppDataContext (données + actions)
  data/          Données de démonstration (articles, mouvements, demandes, utilisateurs)
  layouts/       Coquilles d'espace : UserLayout et ManagerLayout (barre latérale + garde de rôle)
  components/    Éléments partagés (StatusPill, Button, Modal, PageHeader, EmptyState...)
  pages/
    utilisateur/ Catalogue, nouvelle demande, mes demandes, détail d'une demande
    gestionnaire/Tableau de bord, articles, entrées/sorties, alertes, demandes, bons, historique, rapports
    BonPrint.jsx Bon de sortie imprimable (mise en page dédiée, distincte du reste de l'application)
  utils/         Formatage (dates, nombres) et configuration des statuts (niveaux de stock, états des demandes)
```

## Identité visuelle

Le design s'appuie sur le vocabulaire du métier (registre, bon, traçabilité) plutôt que sur un habillage générique : encre marine et papier ivoire pour la structure, accent laiton pour les actions principales, et un système de statuts rouge/orange/vert toujours accompagné d'une icône et d'un libellé (jamais la couleur seule). Les références et les quantités sont composées en chiffres tabulaires pour rester lisibles en colonne, et le bon de sortie a sa propre mise en page de document officiel puisqu'il quitte l'écran pour être imprimé.
