import { dossierDocumentRepository } from "./document.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import fs from "fs";
import path from "path";

export async function validerRattachementDocument(
  casId: string,
  checklistItemId?: string
) {
  const cas = await prisma.case.findUnique({
    where: { id: casId },
    select: { id: true },
  });
  if (!cas) {
    throw ErreurApi.nonTrouve("الملف");
  }
  if (!checklistItemId) return;

  const checklistItem = await prisma.caseChecklistItem.findFirst({
    where: {
      id: checklistItemId,
      casId,
    },
    select: { id: true },
  });
  if (!checklistItem) {
    throw ErreurApi.donneesInvalides(
      "المستند المطلوب لا ينتمي إلى هذا الملف"
    );
  }
}

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

    await validerRattachementDocument(donnees.casId, donnees.checklistItemId);

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

  async mettreAJour(
    id: string,
    donnees: {
      nom?: string;
      description?: string | null;
      commentaires?: string | null;
      etat?: string;
      isClientVisible?: boolean;
    },
    userId: string
  ) {
    const existant = await dossierDocumentRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Document");
    }

    const donneesNettoyees: {
      nom?: string;
      description?: string | null;
      commentaires?: string | null;
      etat?: string;
      isClientVisible?: boolean;
    } = {};

    if (donnees.nom !== undefined) {
      if (typeof donnees.nom !== "string" || !donnees.nom.trim()) {
        throw ErreurApi.donneesInvalides("اسم المستند مطلوب");
      }
      donneesNettoyees.nom = donnees.nom.trim();
    }
    if (donnees.description !== undefined) {
      donneesNettoyees.description =
        typeof donnees.description === "string"
          ? donnees.description.trim() || null
          : null;
    }
    if (donnees.commentaires !== undefined) {
      donneesNettoyees.commentaires =
        typeof donnees.commentaires === "string"
          ? donnees.commentaires.trim() || null
          : null;
    }
    if (donnees.etat !== undefined) {
      if (!["en_attente", "valide", "rejete"].includes(donnees.etat)) {
        throw ErreurApi.donneesInvalides("حالة المستند غير صالحة");
      }
      donneesNettoyees.etat = donnees.etat;
    }
    if (donnees.isClientVisible !== undefined) {
      if (typeof donnees.isClientVisible !== "boolean") {
        throw ErreurApi.donneesInvalides("إعداد ظهور المستند غير صالح");
      }
      donneesNettoyees.isClientVisible = donnees.isClientVisible;
    }
    if (Object.keys(donneesNettoyees).length === 0) {
      throw ErreurApi.donneesInvalides("لا توجد بيانات لتحديث المستند");
    }

    const doc = await dossierDocumentRepository.mettreAJour(id, donneesNettoyees);

    await dossierActiviteRepository.creer({
      userId,
      action: "modification",
      entite: "document",
      entiteId: id,
      description: `تعديل المستند : ${donneesNettoyees.nom || existant.nom}`,
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

    if (existant.checklistItemId) {
      const documentsRestants = await prisma.document.count({
        where: { checklistItemId: existant.checklistItemId },
      });

      if (documentsRestants === 0) {
        await prisma.caseChecklistItem.update({
          where: { id: existant.checklistItemId },
          data: { coche: false },
        });
      }

      const checklistItems = await prisma.caseChecklistItem.findMany({
        where: { casId: existant.casId },
      });
      const totalItems = checklistItems.filter((item) => item.obligatoire).length;
      const itemsCoches = checklistItems.filter(
        (item) => item.obligatoire && item.coche
      ).length;
      const progression =
        totalItems > 0 ? Math.round((itemsCoches / totalItems) * 100) : 0;

      await prisma.case.update({
        where: { id: existant.casId },
        data: { progress: progression },
      });
    }

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
