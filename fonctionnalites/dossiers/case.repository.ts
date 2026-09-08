import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const dossierCaseRepository = {
  async trouverTous(params: {
    skip?: number;
    take?: number;
    recherche?: string;
    etat?: string;
    type?: string;
    clientId?: string;
  }) {
    const ou: any = {};
    if (params.recherche) {
      const r = params.recherche;
      ou.OR = [
        { reference: { contains: r, mode: "insensitive" } },
        { mahakimRef: { contains: r, mode: "insensitive" } },
        { tribunal: { contains: r, mode: "insensitive" } },
        { type: { contains: r, mode: "insensitive" } },
        { description: { contains: r, mode: "insensitive" } },
        { client: { nom: { contains: r, mode: "insensitive" } } },
        { client: { prenom: { contains: r, mode: "insensitive" } } },
      ];
    }
    if (params.etat) ou.etat = params.etat;
    if (params.type) ou.type = params.type;
    if (params.clientId) ou.clientId = params.clientId;
    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: ou,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, nom: true, prenom: true, cin: true } },
          _count: { select: { documents: true, hearings: true } },
        },
      }),
      prisma.case.count({ where: ou }),
    ]);
    return { cases, total };
  },
  async trouverParId(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        template: { include: { documents: true } },
        documents: {
          include: { type: true },
          orderBy: { uploadedAt: "desc" },
        },
        checklist: { orderBy: { ordre: "asc" } },
        hearings: { orderBy: { date: "desc" } },
        payments: { orderBy: { date: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
    });
  },
  async creer(donnees: {
    reference: string;
    clientId: string;
    type: string;
    sousType?: string;
    tribunal?: string;
    dateCreation: Date;
    description?: string;
    notes?: string;
    templateId?: string;
    caseTypeId?: string;
    mahakimRef?: string;
  }) {
    return prisma.case.create({ data: donnees });
  },
  async mettreAJour(id: string, donnees: any) {
    return prisma.case.update({ where: { id }, data: donnees });
  },
  async supprimer(id: string) {
    return prisma.case.delete({ where: { id } });
  },
  async compter() {
    return prisma.case.count();
  },
  async compterParEtat() {
    const groupes = await prisma.case.groupBy({
      by: ["etat"],
      _count: true,
    });
    return groupes.reduce(
      (acc, g) => ({ ...acc, [g.etat]: g._count }),
      {} as Record<string, number>
    );
  },
};
