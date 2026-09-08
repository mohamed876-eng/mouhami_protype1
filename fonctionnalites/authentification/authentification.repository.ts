import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierUtilisateurRepository = {
  async trouverParEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async trouverParId(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async trouverProfilParId(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true,
        isActive: true,
        clientId: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });
  },
  async creer(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
  }) {
    return prisma.user.create({ data });
  },
  async mettreAJourJetonRafraichissement(
    userId: string,
    refreshToken: string | null
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  },
  async mettreAJourConnexion(userId: string, refreshToken: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken, lastLogin: new Date() },
    });
  },
  async mettreAJourMotDePasse(userId: string, nouveauMotDePasse: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: nouveauMotDePasse },
    });
  },
};
