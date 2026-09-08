import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierAudienceRepository = {
  async trouverTous(params: { skip?: number; take?: number }) {
    return prisma.hearing.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { date: "desc" },
      include: {
        cas: {
          select: {
            reference: true,
            client: { select: { nom: true, prenom: true } },
          },
        },
      },
    });
  },
  async trouverParCasId(casId: string) {
    return prisma.hearing.findMany({
      where: { casId },
      orderBy: { date: "desc" },
    });
  },
  async trouverParId(id: string) {
    return prisma.hearing.findUnique({ where: { id } });
  },
  async creer(donnees: {
    casId: string;
    date: Date;
    heure?: string;
    type?: string;
    tribunal?: string;
    salle?: string;
    juge?: string;
    notes?: string;
  }) {
    return prisma.hearing.create({ data: donnees });
  },
  async mettreAJour(id: string, donnees: any) {
    return prisma.hearing.update({ where: { id }, data: donnees });
  },
  async supprimer(id: string) {
    return prisma.hearing.delete({ where: { id } });
  },
  async compterProchaines() {
    return prisma.hearing.count({
      where: { date: { gte: new Date() }, statut: "planifiee" },
    });
  },
  async trouverProchaines(limite: number = 10) {
    return prisma.hearing.findMany({
      where: { date: { gte: new Date() }, statut: "planifiee" },
      include: {
        cas: {
          include: { client: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { date: "asc" },
      take: limite,
    });
  },
};
