import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const serviceRecherche = {
  async rechercher(requete: string, limite: number = 20) {
    if (!requete || requete.length < 2) {
      return {
        clients: [],
        cases: [],
        documents: [],
        caseTypes: [],
      };
    }

    const termeRecherche = requete.trim();
    const conditionsRecherche = {
      contains: termeRecherche,
      mode: "insensitive" as const,
    };

    const [clients, cases, documents, caseTypes] = await Promise.all([
      prisma.client.findMany({
        where: {
          OR: [
            { nom: conditionsRecherche },
            { prenom: conditionsRecherche },
            { cin: conditionsRecherche },
            { telephone: conditionsRecherche },
            { email: conditionsRecherche },
            { ville: conditionsRecherche },
            { profession: conditionsRecherche },
          ],
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          cin: true,
          telephone: true,
          ville: true,
          photo: true,
        },
        take: limite,
        orderBy: { createdAt: "desc" },
      }),

      prisma.case.findMany({
        where: {
          OR: [
            { reference: conditionsRecherche },
            { mahakimRef: conditionsRecherche },
            { tribunal: conditionsRecherche },
            { type: conditionsRecherche },
            { sousType: conditionsRecherche },
            { description: conditionsRecherche },
            { notes: conditionsRecherche },
            { client: { nom: conditionsRecherche } },
            { client: { prenom: conditionsRecherche } },
            { caseType: { nameAr: conditionsRecherche } },
          ],
        },
        select: {
          id: true,
          reference: true,
          type: true,
          tribunal: true,
          etat: true,
          client: { select: { id: true, nom: true, prenom: true } },
        },
        take: limite,
        orderBy: { createdAt: "desc" },
      }),

      prisma.document.findMany({
        where: {
          OR: [
            { nom: conditionsRecherche },
            { description: conditionsRecherche },
            { fileName: conditionsRecherche },
            { auteur: conditionsRecherche },
            { commentaires: conditionsRecherche },
          ],
        },
        select: {
          id: true,
          nom: true,
          description: true,
          uploadedAt: true,
          cas: { select: { reference: true } },
        },
        take: limite,
        orderBy: { uploadedAt: "desc" },
      }),

      prisma.caseType.findMany({
        where: {
          OR: [
            { nameAr: conditionsRecherche },
            { description: conditionsRecherche },
          ],
        },
        select: {
          id: true,
          nameAr: true,
          description: true,
        },
        take: limite,
        orderBy: { nameAr: "asc" },
      }),
    ]);

    return {
      query: termeRecherche,
      totalResults: clients.length + cases.length + documents.length + caseTypes.length,
      clients,
      cases,
      documents,
      caseTypes,
    };
  },
};
