import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierDocumentRepository = {
  async trouverParCasId(casId: string) {
    return prisma.document.findMany({
      where: { casId },
      include: { type: true },
      orderBy: { uploadedAt: "desc" },
    });
  },
  async trouverParId(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: { cas: { select: { reference: true, client: true } } },
    });
  },
  async creer(donnees: {
    casId: string;
    typeId?: string;
    nom: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    auteur?: string;
    isClientVisible?: boolean;
    checklistItemId?: string;
  }) {
    return prisma.document.create({ data: donnees });
  },
  async mettreAJour(id: string, donnees: any) {
    return prisma.document.update({ where: { id }, data: donnees });
  },
  async supprimer(id: string) {
    return prisma.document.delete({ where: { id } });
  },
  async compter() {
    return prisma.document.count();
  },
  async compterEnAttente() {
    return prisma.document.count({ where: { etat: "en_attente" } });
  },
  async trouverTousTypes() {
    return prisma.documentType.findMany({ orderBy: { nom: "asc" } });
  },
  async trouverTypeParSlug(slug: string) {
    return prisma.documentType.findUnique({ where: { slug } });
  },
  async creerType(donnees: { nom: string; slug: string; icon?: string }) {
    return prisma.documentType.create({ data: donnees });
  },
  async mettreAJourType(id: string, donnees: { nom?: string; icon?: string }) {
    return prisma.documentType.update({ where: { id }, data: donnees });
  },
  async supprimerType(id: string) {
    return prisma.documentType.delete({ where: { id } });
  },
};
