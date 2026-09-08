import { dossierCaseRepository } from "@/fonctionnalites/dossiers/case.repository";
import { dossierAudienceRepository } from "@/fonctionnalites/audiences/audience.repository";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { dossierNotificationRepository } from "@/fonctionnalites/notifications/notification.repository";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";

interface AgregatsTableauDeBord {
  nb_clients: number;
  nb_cases: number;
  nb_documents_attente: number;
  nb_audiences: number;
  cases_par_etat: Record<string, number>;
}

async function obtenirAgregats(): Promise<AgregatsTableauDeBord> {
  const resultats = await prisma.$queryRaw<
    AgregatsTableauDeBord[]
  >`
    SELECT
      (SELECT COUNT(*)::int FROM clients) AS nb_clients,
      (SELECT COUNT(*)::int FROM cases) AS nb_cases,
      (SELECT COUNT(*)::int FROM documents WHERE etat = 'en_attente') AS nb_documents_attente,
      (SELECT COUNT(*)::int FROM hearings WHERE date >= NOW() AND statut = 'planifiee') AS nb_audiences,
      COALESCE(
        (
          SELECT jsonb_object_agg(etat, c)
          FROM (
            SELECT etat, COUNT(*)::int AS c FROM cases GROUP BY etat
          ) sous_groupe
        ),
        '{}'::jsonb
      ) AS cases_par_etat
  `;

  const r = resultats[0];
  return {
    nb_clients: r.nb_clients,
    nb_cases: r.nb_cases,
    nb_documents_attente: r.nb_documents_attente,
    nb_audiences: r.nb_audiences,
    cases_par_etat: r.cases_par_etat,
  };
}

export const serviceTableauDeBord = {
  async obtenirDonnees(userId: string) {
    const [
      agregats,
      activitesRecentes,
      casesRecentes,
      audiencesProchaines,
      notificationsNonLues,
    ] = await Promise.all([
      obtenirAgregats(),
      dossierActiviteRepository.trouverRecents(10),
      dossierCaseRepository.trouverRecents(5),
      dossierAudienceRepository.trouverProchaines(5),
      dossierNotificationRepository.compterNonLues(userId),
    ]);

    return {
      statistiques: {
        clients: agregats.nb_clients,
        cases: agregats.nb_cases,
        audiences: agregats.nb_audiences,
        documentsEnAttente: agregats.nb_documents_attente,
      },
      casesParEtat: agregats.cases_par_etat,
      activitesRecentes,
      casesRecentes,
      audiencesProchaines,
      notifications: {
        nonLues: notificationsNonLues,
      },
    };
  },
};