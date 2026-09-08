import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierNotificationRepository = {
  async trouverParUserId(userId: string, limite: number = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limite,
    });
  },
  async compterNonLues(userId: string) {
    return prisma.notification.count({
      where: { userId, lu: false },
    });
  },
  async marquerCommeLue(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
  },
  async marquerToutesCommeLues(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, lu: false },
      data: { lu: true },
    });
  },
  async creer(donnees: {
    userId: string;
    titre: string;
    message: string;
    type: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    return prisma.notification.create({ data: donnees });
  },
  async supprimerAnciennes() {
    const trenteJours = new Date();
    trenteJours.setDate(trenteJours.getDate() - 30);
    return prisma.notification.deleteMany({
      where: { createdAt: { lt: trenteJours } },
    });
  },
};
