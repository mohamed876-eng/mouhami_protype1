import { NextRequest, NextResponse } from "next/server";
import { dossierNotificationRepository } from "@/fonctionnalites/notifications/notification.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";

export async function GET(request: NextRequest) {
  try {
    const user = exigerAuthentification(request);
    const [notifications, unread] = await Promise.all([
      dossierNotificationRepository.trouverParUserId(user.userId),
      dossierNotificationRepository.compterNonLues(user.userId),
    ]);
    return reponseSucces({ notifications, unread });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
