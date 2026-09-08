import { dossierClientRepository } from "@/fonctionnalites/clients/client.repository";
import { dossierCaseRepository } from "@/fonctionnalites/dossiers/case.repository";
import { dossierDocumentRepository } from "@/fonctionnalites/documents/document.repository";
import { dossierAudienceRepository } from "@/fonctionnalites/audiences/audience.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { dossierNotificationRepository } from "@/fonctionnalites/notifications/notification.repository";

export const serviceTableauDeBord = {
  async obtenirDonnees(userId: string) {
    const [
      nombreClients,
      nombreCases,
      nombreAudiences,
      documentsEnAttente,
      activitesRecentes,
      casesRecentes,
      audiencesProchaines,
      notificationsNonLues,
    ] = await Promise.all([
      dossierClientRepository.compter(),
      dossierCaseRepository.compter(),
      dossierAudienceRepository.compterProchaines(),
      dossierDocumentRepository.compterEnAttente(),
      dossierActiviteRepository.trouverRecents(10),
      dossierCaseRepository.trouverTous({ take: 5 }),
      dossierAudienceRepository.trouverProchaines(5),
      dossierNotificationRepository.compterNonLues(userId),
    ]);

    const casesParEtat = await dossierCaseRepository.compterParEtat();

    return {
      statistiques: {
        clients: nombreClients,
        cases: nombreCases,
        audiences: nombreAudiences,
        documentsEnAttente,
      },
      casesParEtat,
      activitesRecentes,
      casesRecentes: casesRecentes.cases,
      audiencesProchaines,
      notifications: {
        nonLues: notificationsNonLues,
      },
    };
  },
};
