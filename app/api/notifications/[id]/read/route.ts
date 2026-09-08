import { NextRequest, NextResponse } from "next/server";
import { dossierNotificationRepository } from "@/fonctionnalites/notifications/notification.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    await dossierNotificationRepository.marquerCommeLue(id);
    return reponseSucces({ message: "تمت قراءة الإشعار" });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
