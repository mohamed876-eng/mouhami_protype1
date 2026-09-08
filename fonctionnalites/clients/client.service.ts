import { dossierClientRepository } from "./client.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";

export const serviceClients = {
  async trouverTous(params: {
    page?: number;
    limite?: number;
    recherche?: string;
  }) {
    const page = params.page || 1;
    const limite = params.limite || 20;
    const saut = (page - 1) * limite;

    const resultat = await dossierClientRepository.trouverTous({
      skip: saut,
      take: limite,
      recherche: params.recherche,
    });

    return {
      clients: resultat.clients,
      pagination: {
        page,
        limite,
        total: resultat.total,
        totalPages: Math.ceil(resultat.total / limite),
      },
    };
  },

  async trouverParId(id: string) {
    const client = await dossierClientRepository.trouverParId(id);
    if (!client) {
      throw ErreurApi.nonTrouve("Client");
    }
    return client;
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
    userId?: string;
  }) {
    const { userId, ...donneesClient } = data;
    const client = await dossierClientRepository.creer(donneesClient);

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { clientId: client.id },
      });
      await dossierActiviteRepository.creer({
        userId,
        action: "creation",
        entite: "client",
        entiteId: client.id,
        description: `إضافة عميل جديد : ${donneesClient.prenom} ${donneesClient.nom}`,
      });
    }

    return client;
  },

  async mettreAJour(id: string, donnees: any, userId: string) {
    const existant = await dossierClientRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Client");
    }

    const client = await dossierClientRepository.mettreAJour(id, donnees);

    await dossierActiviteRepository.creer({
      userId,
      action: "modification",
      entite: "client",
      entiteId: id,
      description: `تعديل بيانات العميل : ${donnees.prenom || existant.prenom} ${
        donnees.nom || existant.nom
      }`,
    });

    return client;
  },

  async supprimer(id: string, userId: string) {
    const existant = await dossierClientRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Client");
    }

    await dossierClientRepository.supprimer(id);

    await dossierActiviteRepository.creer({
      userId,
      action: "suppression",
      entite: "client",
      entiteId: id,
      description: `حذف العميل : ${existant.prenom} ${existant.nom}`,
    });
  },

  async trouverParUserId(userId: string) {
    const client = await dossierClientRepository.trouverParUserId(userId);
    if (!client) {
      throw ErreurApi.nonTrouve("Client");
    }
    return client;
  },

  async mettreAJourPropre(
    id: string,
    donnees: {
      telephone?: string;
      adresse?: string;
      ville?: string;
    },
    userId: string
  ) {
    const existant = await dossierClientRepository.trouverParId(id);
    if (!existant) {
      throw ErreurApi.nonTrouve("Client");
    }

    const utilisateur = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!utilisateur || utilisateur.clientId !== id) {
      throw ErreurApi.autorisationRefusee(
        "لا يمكنك تعديل بيانات هذا العميل"
      );
    }

    return dossierClientRepository.mettreAJour(id, donnees);
  },

  async statistiques() {
    const total = await dossierClientRepository.compter();
    return { total };
  },
};
