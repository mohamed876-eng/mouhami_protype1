import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierTypeCasRepository = {
  async trouverTous(params: { seulementActifs?: boolean } = {}) {
    const ou = params.seulementActifs ? { isActive: true } : {};
    return prisma.caseType.findMany({
      where: ou,
      include: {
        documents: { orderBy: { order: "asc" } },
        _count: { select: { cases: true } },
      },
      orderBy: { nameAr: "asc" },
    });
  },
  async trouverParId(id: string) {
    return prisma.caseType.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { order: "asc" } },
        _count: { select: { cases: true } },
      },
    });
  },
  async creer(donnees: {
    nameAr: string;
    description?: string;
    isActive?: boolean;
  }) {
    return prisma.caseType.create({ data: donnees });
  },
  async mettreAJour(
    id: string,
    donnees: { nameAr?: string; description?: string; isActive?: boolean }
  ) {
    return prisma.caseType.update({ where: { id }, data: donnees });
  },
  async supprimer(id: string) {
    return prisma.caseType.delete({ where: { id } });
  },
  async compter() {
    return prisma.caseType.count();
  },
  async trouverDocuments(typeCasId: string) {
    return prisma.caseTypeDocument.findMany({
      where: { caseTypeId: typeCasId },
      orderBy: { order: "asc" },
    });
  },
  async ajouterDocument(donnees: {
    caseTypeId: string;
    nameAr: string;
    description?: string;
    isRequired?: boolean;
    order?: number;
  }) {
    return prisma.caseTypeDocument.create({ data: donnees });
  },
  async mettreAJourDocument(
    id: string,
    donnees: {
      nameAr?: string;
      description?: string;
      isRequired?: boolean;
      order?: number;
    }
  ) {
    return prisma.caseTypeDocument.update({ where: { id }, data: donnees });
  },
  async supprimerDocument(id: string) {
    return prisma.caseTypeDocument.delete({ where: { id } });
  },
};
