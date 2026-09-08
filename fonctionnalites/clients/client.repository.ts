import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierClientRepository = {
  async trouverTous(params: {
    skip?: number;
    take?: number;
    recherche?: string;
  }) {
    const ou: any = {};
    if (params.recherche) {
      const r = params.recherche;
      ou.OR = [
        { nom: { contains: r, mode: "insensitive" } },
        { prenom: { contains: r, mode: "insensitive" } },
        { cin: { contains: r, mode: "insensitive" } },
        { telephone: { contains: r, mode: "insensitive" } },
        { email: { contains: r, mode: "insensitive" } },
      ];
    }
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: ou,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { cases: true } } },
      }),
      prisma.client.count({ where: ou }),
    ]);
    return { clients, total };
  },
  async trouverParId(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { documents: true, hearings: true } } },
        },
      },
    });
  },
  async creer(data: {
    nom: string;
    prenom: string;
    cin: string;
    telephone: string;
    adresse?: string;
    ville?: string;
    profession?: string;
    email?: string;
    observations?: string;
  }) {
    return prisma.client.create({ data });
  },
  async mettreAJour(id: string, data: any) {
    return prisma.client.update({ where: { id }, data });
  },
  async supprimer(id: string) {
    return prisma.client.delete({ where: { id } });
  },
  async trouverParUserId(userId: string) {
    const utilisateur = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    return utilisateur?.client || null;
  },
  async compter() {
    return prisma.client.count();
  },
};
