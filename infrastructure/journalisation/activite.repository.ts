import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierActiviteRepository = {
  async creer(data: {
    userId: string;
    action: string;
    entite: string;
    entiteId?: string;
    description?: string;
    metadata?: any;
    casId?: string;
  }) {
    return prisma.activity.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entite,
        entityId: data.entiteId,
        description: data.description,
        metadata: data.metadata,
        casId: data.casId,
      },
    });
  },
  async trouverRecents(limite: number = 20) {
    return prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: limite,
      include: { user: { select: { nom: true, prenom: true } } },
    });
  },
  async trouverParCasId(casId: string, limite: number = 50) {
    return prisma.activity.findMany({
      where: { casId },
      orderBy: { createdAt: "desc" },
      take: limite,
      include: { user: { select: { nom: true, prenom: true } } },
    });
  },
  async trouverParUserId(userId: string, limite: number = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limite,
    });
  },
};
