import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceTableauDeBord } from "@/fonctionnalites/dashboard/dashboard.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const donnees = await serviceTableauDeBord.obtenirDonnees(utilisateur.userId);
    return reponseSucces({
      stats: donnees.statistiques,
      casesByEtat: donnees.casesParEtat,
      recentActivities: donnees.activitesRecentes,
      recentCases: donnees.casesRecentes,
      upcomingHearings: donnees.audiencesProchaines,
      notifications: {
        unread: donnees.notifications.nonLues,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
