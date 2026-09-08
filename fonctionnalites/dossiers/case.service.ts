import { dossierCaseRepository } from "./case.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";
import { genererReferenceDossier } from "@/infrastructure/base-de-donnees/reference";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const serviceDossiers = {
  async trouverTous(params: {
    page?: number;
    limite?: number;
    recherche?: string;
    etat?: string;
    type?: string;
    clientId?: string;
  }) {
    const page = params.page || 1;
    const limite = params.limite || 20;
    const saut = (page - 1) * limite;

    const resultat = await dossierCaseRepository.trouverTous({
      skip: saut,
      take: limite,
      recherche: params.recherche,
      etat: params.etat,
      type: params.type,
      clientId: params.clientId,
    });

    return {
      cases: resultat.cases,
      pagination: {
        page,
        limite,
        total: resultat.total,
        totalPages: Math.ceil(resultat.total / limite),
      },
    };
  },

  async trouverParId(id: string) {
    const cas = await dossierCaseRepository.trouverParId(id);
    if (!cas) {
      throw ErreurApi.nonTrouve("Dossier");
    }
    return cas;
  },

  async creer(donnees: {
    clientId: string;
    type: string;
    sousType?: string;
    tribunal?: string;
    dateCreation?: Date;
    description?: string;
    notes?: string;
    templateId?: string;
    caseTypeId?: string;
    mahakimRef?: string;
    userId: string;
  }) {
    const reference = genererReferenceDossier();

    const cas = await prisma.$transaction(async (tx) => {
      const nouveauCas = await tx.case.create({
        data: {
          reference,
          clientId: donnees.clientId,
          type: donnees.type,
          sousType: donnees.sousType || undefined,
          tribunal: donnees.tribunal || undefined,
          dateCreation: donnees.dateCreation || new Date(),
          description: donnees.description || undefined,
          notes: donnees.notes || undefined,
          templateId: donnees.templateId || undefined,
          caseTypeId: donnees.caseTypeId || undefined,
          mahakimRef: donnees.mahakimRef || undefined,
        },
      });

      let documentsChecklist: {
        nom: string;
        obligatoire: boolean;
        ordre: number;
      }[] = [];

      if (donnees.templateId) {
        const docsModele = await tx.caseTemplateDocument.findMany({
          where: { templateId: donnees.templateId },
          orderBy: { ordre: "asc" },
        });
        documentsChecklist = docsModele.map((doc) => ({
          nom: doc.nom,
          obligatoire: doc.obligatoire,
          ordre: doc.ordre,
        }));
      }

      if (donnees.caseTypeId) {
        const docsTypeCas = await tx.caseTypeDocument.findMany({
          where: { caseTypeId: donnees.caseTypeId },
          orderBy: { order: "asc" },
        });
        documentsChecklist = docsTypeCas.map((doc) => ({
          nom: doc.nameAr,
          obligatoire: doc.isRequired,
          ordre: doc.order,
        }));
      }

      if (documentsChecklist.length > 0) {
        await tx.caseChecklistItem.createMany({
          data: documentsChecklist.map((doc) => ({
            casId: nouveauCas.id,
            nom: doc.nom,
            obligatoire: doc.obligatoire,
            ordre: doc.ordre,
            coche: false,
          })),
        });
      }

      return nouveauCas;
    });

    await dossierActiviteRepository.creer({
      userId: donnees.userId,
      action: "creation",
      entite: "case",
      entiteId: cas.id,
      description: `إنشاء ملف جديد : ${reference} - ${donnees.type}`,
      casId: cas.id,
    });

    return dossierCaseRepository.trouverParId(cas.id);
  },

  async mettreAJour(id: string, donnees: any, userId: string) {
    const existant = await dossierCaseRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Dossier");
    }

    const donneesNettoyees = { ...donnees };
    for (const cle of [
      "templateId",
      "mahakimRef",
      "sousType",
      "tribunal",
      "description",
      "notes",
    ]) {
      if (donneesNettoyees[cle] === "") donneesNettoyees[cle] = undefined;
    }

    const cas = await dossierCaseRepository.mettreAJour(id, donneesNettoyees);

    await dossierActiviteRepository.creer({
      userId,
      action: "modification",
      entite: "case",
      entiteId: id,
      description: `تعديل الملف : ${existant.reference}`,
      casId: id,
    });

    return cas;
  },

  async supprimer(id: string, userId: string) {
    const existant = await dossierCaseRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Dossier");
    }

    await dossierCaseRepository.supprimer(id);

    await dossierActiviteRepository.creer({
      userId,
      action: "suppression",
      entite: "case",
      entiteId: id,
      description: `حذف الملف : ${existant.reference}`,
    });
  },

  async basculerChecklist(
    itemId: string,
    coche: boolean,
    userId: string,
    casId: string
  ) {
    const item = await prisma.caseChecklistItem.update({
      where: { id: itemId },
      data: { coche },
    });

    const tousItems = await prisma.caseChecklistItem.findMany({
      where: { casId },
    });

    const totalItems = tousItems.filter((i) => i.obligatoire).length;
    const itemsCoches = tousItems.filter(
      (i) => i.obligatoire && i.coche
    ).length;
    const progression =
      totalItems > 0 ? Math.round((itemsCoches / totalItems) * 100) : 0;

    await prisma.case.update({
      where: { id: casId },
      data: { progress: progression },
    });

    await dossierActiviteRepository.creer({
      userId,
      action: "modification",
      entite: "case",
      entiteId: casId,
      description: `${coche ? "تأكيد" : "إلغاء"} : ${item.nom}`,
      casId,
    });

    return { progression, item };
  },

  async statistiques() {
    const total = await dossierCaseRepository.compter();
    const parEtat = await dossierCaseRepository.compterParEtat();
    return { total, parEtat };
  },

  async obtenirDonneesExport(id: string) {
    const cas = await this.trouverParId(id);
    return {
      reference: cas.reference,
      mahakimRef: cas.mahakimRef || undefined,
      type: cas.type,
      sousType: cas.sousType || undefined,
      tribunal: cas.tribunal || undefined,
      dateCreation: cas.dateCreation.toISOString().split("T")[0],
      etat: cas.etat,
      description: cas.description || undefined,
      notes: cas.notes || undefined,
      progress: cas.progress,
      client: {
        nom: cas.client.nom,
        prenom: cas.client.prenom,
        cin: cas.client.cin,
        telephone: cas.client.telephone,
        adresse: cas.client.adresse || undefined,
        ville: cas.client.ville || undefined,
      },
      documents: cas.documents.map((d) => ({
        nom: d.nom,
        fileName: d.fileName,
        etat: d.etat,
        uploadedAt: d.uploadedAt.toISOString(),
      })),
      hearings: cas.hearings.map((h) => ({
        date: h.date.toISOString(),
        type: h.type || undefined,
        tribunal: h.tribunal || undefined,
        statut: h.statut,
      })),
    };
  },
};
