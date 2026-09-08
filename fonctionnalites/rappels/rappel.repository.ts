import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierRappelRepository = {
  async creerEvenement(donnees: any) {
    return prisma.reminderEvent.create({ data: donnees });
  },
  async mettreAJourEvenement(id: string, donnees: any) {
    return prisma.reminderEvent.update({ where: { id }, data: donnees });
  },
  async supprimerEvenement(id: string) {
    await prisma.reminder.deleteMany({ where: { eventId: id } });
    return prisma.reminderEvent.delete({ where: { id } });
  },
  async trouverEvenementParId(id: string) {
    return prisma.reminderEvent.findUnique({
      where: { id },
      include: { client: true, cas: true, reminders: true },
    });
  },
  async trouverEvenementsParUtilisateur(userId: string) {
    return prisma.reminderEvent.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      include: { client: true, cas: true },
    });
  },
  async creerRappels(donnees: any[]) {
    return prisma.reminder.createMany({ data: donnees });
  },
  async trouverRappelsEnAttente(userId: string) {
    const maintenant = new Date();
    return prisma.reminder.findMany({
      where: {
        userId,
        notified: false,
        dismissed: false,
        remindAt: { lte: maintenant },
      },
      include: { event: { include: { client: true, cas: true } } },
      orderBy: { remindAt: "asc" },
    });
  },
  async trouverProchainEvenement(userId: string) {
    const maintenant = new Date();
    return prisma.reminderEvent.findFirst({
      where: { userId, date: { gte: maintenant } },
      orderBy: { date: "asc" },
      include: { client: true, cas: true },
    });
  },
  async trouverEvenementsAujourdhui(userId: string) {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    return prisma.reminderEvent.findMany({
      where: { userId, date: { gte: debut, lte: fin } },
      orderBy: { time: "asc" },
      include: { client: true, cas: true },
    });
  },
  async marquerNotifie(id: string) {
    return prisma.reminder.update({
      where: { id },
      data: { notified: true },
    });
  },
  async ignorerRappel(id: string) {
    return prisma.reminder.update({
      where: { id },
      data: { dismissed: true },
    });
  },
  async compterEnAttente(userId: string) {
    const maintenant = new Date();
    return prisma.reminder.count({
      where: {
        userId,
        notified: false,
        dismissed: false,
        remindAt: { lte: maintenant },
      },
    });
  },
  async supprimerRappelsParEvenement(eventId: string) {
    return prisma.reminder.deleteMany({ where: { eventId } });
  },
};
