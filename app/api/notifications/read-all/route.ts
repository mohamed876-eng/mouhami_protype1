import { NextRequest, NextResponse } from "next/server";
import { dossierNotificationRepository } from "@/fonctionnalites/notifications/notification.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";

export async function PUT(request: NextRequest) {
  try {
    const user = exigerAuthentification(request);
    await dossierNotificationRepository.marquerToutesCommeLues(user.userId);
    return reponseSucces({ message: "تمت قراءة جميع الإشعارات" });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
