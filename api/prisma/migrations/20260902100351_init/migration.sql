-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'gestionnaire', 'utilisateur');

-- CreateEnum
CREATE TYPE "ArticleStatut" AS ENUM ('disponible', 'desactive');

-- CreateEnum
CREATE TYPE "MouvementType" AS ENUM ('entree', 'sortie');

-- CreateEnum
CREATE TYPE "DemandeStatut" AS ENUM ('en_attente', 'approuvee', 'rejetee');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "seuil" INTEGER NOT NULL DEFAULT 0,
    "statut" "ArticleStatut" NOT NULL DEFAULT 'disponible',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mouvement" (
    "id" TEXT NOT NULL,
    "type" "MouvementType" NOT NULL,
    "articleId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provenance" TEXT,
    "beneficiaire" TEXT,
    "document" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "observation" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Mouvement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "demandeurId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT NOT NULL DEFAULT '',
    "statut" "DemandeStatut" NOT NULL DEFAULT 'en_attente',
    "traiteParId" TEXT,
    "dateTraitement" TIMESTAMP(3),
    "bonNumero" TEXT,
    "motifRejet" TEXT,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeLigne" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "DemandeLigne_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Article_reference_key" ON "Article"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Demande_numero_key" ON "Demande"("numero");

-- AddForeignKey
ALTER TABLE "Mouvement" ADD CONSTRAINT "Mouvement_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mouvement" ADD CONSTRAINT "Mouvement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeLigne" ADD CONSTRAINT "DemandeLigne_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeLigne" ADD CONSTRAINT "DemandeLigne_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
