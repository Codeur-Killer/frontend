import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hash(password) {
  return bcrypt.hash(password, 10)
}

const users = [
  { key: 'u1', nom: 'Koffi Mensah', email: 'koffi.mensah@ugp-boad.tg', password: 'ugpboad2026', poste: 'Développeur', role: 'utilisateur' },
  { key: 'u2', nom: 'Akouvi Dogbé', email: 'akouvi.dogbe@ugp-boad.tg', password: 'ugpboad2026', poste: 'Assistante administrative', role: 'utilisateur' },
  { key: 'u3', nom: 'Essowè Kolani', email: 'essowe.kolani@ugp-boad.tg', password: 'ugpboad2026', poste: 'Technicien', role: 'utilisateur' },
  { key: 'u4', nom: 'Ama Sossou', email: 'ama.sossou@ugp-boad.tg', password: 'ugpboad2026', poste: 'Chargée de communication', role: 'utilisateur' },
  { key: 'u5', nom: 'Kokou Adjovi', email: 'kokou.adjovi@ugp-boad.tg', password: 'ugpboad2026', poste: 'Comptable', role: 'utilisateur' },
  { key: 'g1', nom: 'Yawa Amétépé', email: 'yawa.ametepe@ugp-boad.tg', password: 'ugpboad2026', poste: 'Gestionnaire de stock', role: 'gestionnaire' },
  { key: 'g2', nom: 'Essodina Bakoma', email: 'essodina.bakoma@ugp-boad.tg', password: 'ugpboad2026', poste: 'Gestionnaire de stock', role: 'gestionnaire' },
  { key: 'adm1', nom: 'Nicolas Purs', email: 'admin@ugp-boad.tg', password: 'admin2026', poste: 'Administrateur système', role: 'admin' },
]

const programmes = [
  { key: 'p1', nom: "Programme d'Urgence de Renforcement de la Résilience et de la Sécurité des Communautés", code: 'PURS' },
  { key: 'p2', nom: "Programme d'Appui à la Gouvernance Locale", code: 'PAGL' },
]


const programmeMembres = [
  { programmeKey: 'p1', userKey: 'g1' },
  { programmeKey: 'p2', userKey: 'g1' },
  { programmeKey: 'p2', userKey: 'g2' },
  { programmeKey: 'p1', userKey: 'u1' },
  { programmeKey: 'p1', userKey: 'u2' },
  { programmeKey: 'p1', userKey: 'u3' },
  { programmeKey: 'p1', userKey: 'u4' },
  { programmeKey: 'p1', userKey: 'u5' },
  { programmeKey: 'p2', userKey: 'u2' },
]

const articles = [
  { key: 'a1', reference: 'ART-000101', designation: 'Papier A4', categorie: 'Fournitures de bureau', unite: 'Paquet', stock: 42, seuil: 20, statut: 'disponible', dateCreation: '2026-02-11', programmeKey: 'p1' },
  { key: 'a2', reference: 'ART-000102', designation: 'Stylos bleus', categorie: 'Fournitures de bureau', unite: 'Boîte', stock: 15, seuil: 15, statut: 'disponible', dateCreation: '2026-02-11', programmeKey: 'p1' },
  { key: 'a3', reference: 'ART-000103', designation: 'Classeurs à levier', categorie: 'Fournitures de bureau', unite: 'Unité', stock: 6, seuil: 12, statut: 'disponible', dateCreation: '2026-02-18', programmeKey: 'p1' },
  { key: 'a4', reference: 'ART-000104', designation: 'Agrafeuses', categorie: 'Fournitures de bureau', unite: 'Unité', stock: 3, seuil: 10, statut: 'disponible', dateCreation: '2026-03-02', programmeKey: 'p1' },
  { key: 'a5', reference: 'ART-000105', designation: "Cartouches d'encre HP 305", categorie: 'Informatique', unite: 'Unité', stock: 5, seuil: 8, statut: 'disponible', dateCreation: '2026-03-14', programmeKey: 'p1' },
  { key: 'a6', reference: 'ART-000106', designation: 'Ordinateur portable', categorie: 'Informatique', unite: 'Unité', stock: 8, seuil: 3, statut: 'disponible', dateCreation: '2026-01-20', programmeKey: 'p1' },
  { key: 'a7', reference: 'ART-000107', designation: 'Souris optique', categorie: 'Informatique', unite: 'Unité', stock: 2, seuil: 10, statut: 'disponible', dateCreation: '2026-04-05', programmeKey: 'p1' },
  { key: 'a8', reference: 'ART-000108', designation: 'Rame de papier photocopie', categorie: 'Fournitures de bureau', unite: 'Paquet', stock: 60, seuil: 25, statut: 'disponible', dateCreation: '2026-02-11', programmeKey: 'p1' },
  { key: 'a9', reference: 'ART-000109', designation: 'Chaise de bureau', categorie: 'Mobilier', unite: 'Unité', stock: 5, seuil: 4, statut: 'disponible', dateCreation: '2026-01-09', programmeKey: 'p1' },
  { key: 'a10', reference: 'ART-000110', designation: 'Bureau ministre', categorie: 'Mobilier', unite: 'Unité', stock: 1, seuil: 2, statut: 'disponible', dateCreation: '2026-01-09', programmeKey: 'p1' },
  { key: 'a11', reference: 'ART-000111', designation: 'Détergent multi-usage', categorie: 'Entretien', unite: 'Bidon', stock: 9, seuil: 10, statut: 'disponible', dateCreation: '2026-05-06', programmeKey: 'p1' },
  { key: 'a12', reference: 'ART-000112', designation: 'Gants de nettoyage', categorie: 'Entretien', unite: 'Paire', stock: 0, seuil: 15, statut: 'disponible', dateCreation: '2026-05-06', programmeKey: 'p1' },
  { key: 'a13', reference: 'ART-000113', designation: 'Café', categorie: 'Consommables', unite: 'Paquet', stock: 22, seuil: 10, statut: 'disponible', dateCreation: '2026-06-01', programmeKey: 'p1' },
  { key: 'a14', reference: 'ART-000114', designation: 'Classeur suspendu', categorie: 'Fournitures de bureau', unite: 'Unité', stock: 30, seuil: 15, statut: 'disponible', dateCreation: '2026-02-18', programmeKey: 'p1' },
  { key: 'a15', reference: 'ART-000115', designation: 'Onduleur 650VA', categorie: 'Informatique', unite: 'Unité', stock: 0, seuil: 5, statut: 'desactive', dateCreation: '2025-11-02', programmeKey: 'p1' },
  { key: 'a16', reference: 'ART-000201', designation: 'Kits sanitaires', categorie: 'Entretien', unite: 'Kit', stock: 25, seuil: 10, statut: 'disponible', dateCreation: '2026-04-01', programmeKey: 'p2' },
  { key: 'a17', reference: 'ART-000202', designation: 'Radios VHF', categorie: 'Informatique', unite: 'Unité', stock: 6, seuil: 4, statut: 'disponible', dateCreation: '2026-04-01', programmeKey: 'p2' },
]

const mouvements = [
  { type: 'entree', articleKey: 'a1', quantite: 50, date: '2026-08-04', provenance: 'Papeterie du Golfe', document: 'BL-2026-0341', utilisateurKey: 'g1', observation: '' },
  { type: 'sortie', articleKey: 'a1', quantite: 8, date: '2026-08-06', beneficiaire: 'Direction Technique', document: '001/2026/PC/PURS/CG/UGP-BOAD', utilisateurKey: 'g1', observation: '' },
  { type: 'entree', articleKey: 'a5', quantite: 6, date: '2026-08-10', provenance: 'InfoPlus SARL', document: 'BL-2026-0349', utilisateurKey: 'g1', observation: '' },
  { type: 'sortie', articleKey: 'a5', quantite: 7, date: '2026-08-19', beneficiaire: 'Service Informatique', document: 'BS-2026-00121', utilisateurKey: 'g1', observation: '' },
  { type: 'entree', articleKey: 'a3', quantite: 20, date: '2026-07-22', provenance: 'Papeterie du Golfe', document: 'BL-2026-0322', utilisateurKey: 'g1', observation: '' },
  { type: 'sortie', articleKey: 'a3', quantite: 14, date: '2026-08-15', beneficiaire: 'Direction des Ressources Humaines', document: '003/2026/PC/PURS/CG/UGP-BOAD', utilisateurKey: 'g1', observation: '' },
  { type: 'entree', articleKey: 'a12', quantite: 15, date: '2026-06-01', provenance: 'ProNet Hygiène', document: 'BL-2026-0288', utilisateurKey: 'g1', observation: '' },
  { type: 'sortie', articleKey: 'a12', quantite: 15, date: '2026-08-20', beneficiaire: 'Direction Technique', document: '002/2026/PC/PURS/CG/UGP-BOAD', utilisateurKey: 'g1', observation: 'Grand nettoyage des locaux' },
  { type: 'entree', articleKey: 'a8', quantite: 40, date: '2026-08-25', provenance: 'Papeterie du Golfe', document: 'BL-2026-0355', utilisateurKey: 'g1', observation: '' },
]

const demandes = [
  {
    numero: 'EB-2026-00121', demandeurKey: 'u1', programmeKey: 'p1', date: '2026-08-22',
    lignes: [{ articleKey: 'a7', quantite: 2 }, { articleKey: 'a5', quantite: 1 }],
    motif: 'Remplacement de matériel défectueux au poste de travail.', statut: 'en_attente',
  },
  {
    numero: 'EB-2026-00122', demandeurKey: 'u2', programmeKey: 'p1', date: '2026-08-23',
    lignes: [{ articleKey: 'a1', quantite: 5 }, { articleKey: 'a2', quantite: 10 }, { articleKey: 'a3', quantite: 3 }],
    motif: 'Besoin en fournitures pour les activités du service.', statut: 'en_attente',
  },
  {
    numero: 'EB-2026-00118', demandeurKey: 'u3', programmeKey: 'p1', date: '2026-08-14',
    lignes: [{ articleKey: 'a12', quantite: 15 }],
    motif: 'Grand nettoyage programmé des bureaux.', statut: 'approuvee',
    traiteParKey: 'g1', dateTraitement: '2026-08-15', bonNumero: '002/2026/PC/PURS/CG/UGP-BOAD',
  },
  {
    numero: 'EB-2026-00110', demandeurKey: 'u5', programmeKey: 'p1', date: '2026-08-05',
    lignes: [{ articleKey: 'a1', quantite: 8 }],
    motif: 'Impression des états financiers du mois.', statut: 'approuvee',
    traiteParKey: 'g1', dateTraitement: '2026-08-06', bonNumero: '001/2026/PC/PURS/CG/UGP-BOAD',
  },
  {
    numero: 'EB-2026-00105', demandeurKey: 'u4', programmeKey: 'p1', date: '2026-07-30',
    lignes: [{ articleKey: 'a10', quantite: 2 }],
    motif: 'Réaménagement du bureau du service communication.', statut: 'rejetee',
    traiteParKey: 'g1', dateTraitement: '2026-07-31', motifRejet: 'Quantité demandée supérieure au stock disponible.',
  },
  {
    numero: 'EB-2026-00119', demandeurKey: 'u2', programmeKey: 'p1', date: '2026-08-15',
    lignes: [{ articleKey: 'a3', quantite: 14 }],
    motif: 'Archivage des dossiers du deuxième trimestre.', statut: 'approuvee',
    traiteParKey: 'g1', dateTraitement: '2026-08-15', bonNumero: '003/2026/PC/PURS/CG/UGP-BOAD',
  },
  {
    numero: 'EB-2026-00201', demandeurKey: 'u2', programmeKey: 'p2', date: '2026-08-28',
    lignes: [{ articleKey: 'a16', quantite: 4 }],
    motif: 'Distribution de kits sanitaires dans les communes pilotes.', statut: 'en_attente',
  },
]

async function main() {
  await prisma.demandeLigne.deleteMany()
  await prisma.demande.deleteMany()
  await prisma.mouvement.deleteMany()
  await prisma.article.deleteMany()
  await prisma.programmeMembre.deleteMany()
  await prisma.programme.deleteMany()
  await prisma.user.deleteMany()

  const userIdByKey = {}
  for (const u of users) {
    const created = await prisma.user.create({
      data: { nom: u.nom, email: u.email, passwordHash: await hash(u.password), poste: u.poste, role: u.role, actif: true },
    })
    userIdByKey[u.key] = created.id
  }

  const programmeIdByKey = {}
  for (const p of programmes) {
    const created = await prisma.programme.create({ data: { nom: p.nom, code: p.code } })
    programmeIdByKey[p.key] = created.id
  }

  for (const m of programmeMembres) {
    await prisma.programmeMembre.create({
      data: { programmeId: programmeIdByKey[m.programmeKey], userId: userIdByKey[m.userKey] },
    })
  }

  const articleIdByKey = {}
  for (const a of articles) {
    const created = await prisma.article.create({
      data: {
        reference: a.reference,
        designation: a.designation,
        categorie: a.categorie,
        unite: a.unite,
        stock: a.stock,
        seuil: a.seuil,
        statut: a.statut,
        dateCreation: new Date(a.dateCreation),
        programmeId: programmeIdByKey[a.programmeKey],
      },
    })
    articleIdByKey[a.key] = created.id
  }

  for (const m of mouvements) {
    await prisma.mouvement.create({
      data: {
        type: m.type,
        articleId: articleIdByKey[m.articleKey],
        quantite: m.quantite,
        date: new Date(m.date),
        provenance: m.provenance,
        beneficiaire: m.beneficiaire,
        document: m.document,
        utilisateurId: userIdByKey[m.utilisateurKey],
        observation: m.observation,
      },
    })
  }

  for (const d of demandes) {
    await prisma.demande.create({
      data: {
        numero: d.numero,
        demandeurId: userIdByKey[d.demandeurKey],
        programmeId: programmeIdByKey[d.programmeKey],
        date: new Date(d.date),
        motif: d.motif || '',
        statut: d.statut,
        traiteParId: d.traiteParKey ? userIdByKey[d.traiteParKey] : null,
        dateTraitement: d.dateTraitement ? new Date(d.dateTraitement) : null,
        bonNumero: d.bonNumero,
        motifRejet: d.motifRejet,
        lignes: { create: d.lignes.map((l) => ({ articleId: articleIdByKey[l.articleKey], quantite: l.quantite })) },
      },
    })
  }

  console.log(`Seed terminé : ${users.length} comptes, ${programmes.length} programmes, ${articles.length} articles, ${mouvements.length} mouvements, ${demandes.length} demandes.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
