import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierUtilisateurRepository = {
  async trouverParEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async trouverParId(id: string) {
    return prisma.user.findUnique({ where: { id } });
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
  async mettreAJourDerniereConnexion(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  },
  async mettreAJourMotDePasse(userId: string, nouveauMotDePasse: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: nouveauMotDePasse },
    });
  },
};
