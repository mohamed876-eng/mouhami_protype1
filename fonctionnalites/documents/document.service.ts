import { dossierDocumentRepository } from "./document.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import fs from "fs";
import path from "path";

const REPERTOIRE_TELECHARGEMENT =
  process.env.UPLOAD_DIR || "./uploads";

export const serviceDocuments = {
  async telecharger(donnees: {
    casId: string;
    typeId?: string;
    checklistItemId?: string;
    nom: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    auteur?: string;
    isClientVisible?: boolean;
    userId: string;
  }) {
    const { userId, ...donneesDoc } = donnees;
    const doc = await dossierDocumentRepository.creer(donneesDoc);

    if (donnees.checklistItemId) {
      await prisma.caseChecklistItem.update({
        where: { id: donnees.checklistItemId },
        data: { coche: true },
      });

      const tousItems = await prisma.caseChecklistItem.findMany({
        where: { casId: donnees.casId },
      });
      const totalItems = tousItems.filter((i) => i.obligatoire).length;
      const itemsCoches = tousItems.filter(
        (i) => i.obligatoire && i.coche
      ).length;
      const progression =
        totalItems > 0 ? Math.round((itemsCoches / totalItems) * 100) : 0;

      await prisma.case.update({
        where: { id: donnees.casId },
        data: { progress: progression },
      });
    }

    await dossierActiviteRepository.creer({
      userId,
      action: "upload",
      entite: "document",
      entiteId: doc.id,
      description: `رفع مستند : ${donneesDoc.nom}`,
      casId: donneesDoc.casId,
    });

    return doc;
  },

  async trouverParCasId(casId: string) {
    return dossierDocumentRepository.trouverParCasId(casId);
  },

  async trouverParId(id: string) {
    const doc = await dossierDocumentRepository.trouverParId(id);
    if (!doc) {
      throw ErreurApi.nonTrouve("Document");
    }
    return doc;
  },

  async mettreAJour(id: string, donnees: any, userId: string) {
    const existant = await dossierDocumentRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Document");
    }

    const doc = await dossierDocumentRepository.mettreAJour(id, donnees);

    await dossierActiviteRepository.creer({
      userId,
      action: "modification",
      entite: "document",
      entiteId: id,
      description: `تعديل المستند : ${donnees.nom || existant.nom}`,
      casId: existant.casId,
    });

    return doc;
  },

  async supprimer(id: string, userId: string) {
    const existant = await dossierDocumentRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Document");
    }

    const cheminFichier = path.resolve(existant.filePath);
    if (fs.existsSync(cheminFichier)) {
      fs.unlinkSync(cheminFichier);
    }

    await dossierDocumentRepository.supprimer(id);

    await dossierActiviteRepository.creer({
      userId,
      action: "suppression",
      entite: "document",
      entiteId: id,
      description: `حذف المستند : ${existant.nom}`,
      casId: existant.casId,
    });
  },

  async trouverTousTypes() {
    return dossierDocumentRepository.trouverTousTypes();
  },

  async creerType(donnees: { nom: string; slug: string; icon?: string }) {
    const existant = await dossierDocumentRepository.trouverTypeParSlug(
      donnees.slug
    );
    if (existant) {
      throw ErreurApi.conflit("هذا النوع موجود بالفعل");
    }
    return dossierDocumentRepository.creerType(donnees);
  },

  async mettreAJourType(
    id: string,
    donnees: { nom?: string; icon?: string }
  ) {
    return dossierDocumentRepository.mettreAJourType(id, donnees);
  },

  async supprimerType(id: string) {
    return dossierDocumentRepository.supprimerType(id);
  },

  async statistiques() {
    const total = await dossierDocumentRepository.compter();
    const enAttente = await dossierDocumentRepository.compterEnAttente();
    return { total, enAttente };
  },
};
